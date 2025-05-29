import BigNumber from 'bignumber.js';
import type { ChainId } from 'blockchain-addressbook';
import jp from 'jsonpath';
import { type Hex, getAddress, isHex } from 'viem';
import SiloV2IncentivesController from '../../../abis/SiloV2IncentivesController.js';
import SiloV2Lens from '../../../abis/SiloV2Lens.js';
import SiloVault from '../../../abis/SiloVault.js';
import SiloIncentivesController from '../../../abis/arbitrum/SiloIncentivesController.js';
import SiloLens from '../../../abis/arbitrum/SiloLens.js';
import SiloTokenAbi from '../../../abis/arbitrum/SiloToken.js';
import { BIG_ZERO } from '../../../utils/big-number.js';
import { fetchPrice, validOracleOrAny } from '../../../utils/fetchPrice.js';
import { fetchContract } from '../../rpc/client.js';
import getApyBreakdown from './getApyBreakdown.js';

const SECONDS_PER_YEAR = 31536000;

export const getSiloApyData = async (params: SiloApyParams) => {
  const poolsData = await getPoolsData(params);

  const { supplyApys, supplySiloApys } = await getPoolsApys(params, poolsData);
  const liquidStakingApys = await getLiquidStakingApys(params.pools);

  if (params.log) {
    params.pools.forEach((pool, i) =>
      console.log(pool.name, supplyApys[i]?.valueOf(), supplySiloApys[i]?.valueOf()),
    );
  }

  return getApyBreakdown(
    params.pools.map((p) => ({ ...p, address: p.name })),
    Object.fromEntries(params.pools.map((p, i) => [p.name, supplyApys[i]!])),
    supplySiloApys,
    0,
    liquidStakingApys,
  );
};

const getPoolsApys = async (params: SiloApyParams, data: PoolsData) => {
  //const compDecimals = params.compDecimals ?? '1e18';
  const annualRewardsInUsd: BigNumber[] = [];
  const totalSuppliesInUsd: BigNumber[] = [];
  const supplyApys: BigNumber[] = [];
  let j = 0;

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i]!;
    let rewards = new BigNumber(0);
    if (pool.rewards) {
      for (const reward of pool.rewards) {
        const oracle = reward.rewardOracle ?? 'tokens';
        const price = await fetchPrice({
          oracle: validOracleOrAny(oracle),
          id: reward.rewardOracleId,
        });
        const periodFinish = data.periodFinish[j];
        const rewardSpeed = data.rewardSpeeds[j];

        if (
          periodFinish &&
          rewardSpeed &&
          periodFinish.isGreaterThanOrEqualTo(Math.floor(Date.now() / 1000))
        ) {
          rewards = rewards.plus(rewardSpeed.times(SECONDS_PER_YEAR).div(reward.rewardDecimals).times(price));
        }
        ++j;
      }
    }

    annualRewardsInUsd.push(rewards);

    const fee = pool.fee ?? 0;
    const numerator = fee > 0 ? 100 - fee : pool.legacy ? 90 : 75;
    const supplyRate = data.supplyRates[i];
    supplyApys.push(supplyRate === undefined ? BIG_ZERO : supplyRate.times(numerator).div(100).div('1e18'));

    const totalSupply = data.totalSupplies[i];
    const decimals = data.decimals[i];
    const tokenPrice = data.tokenPrices[i];
    totalSuppliesInUsd.push(
      totalSupply === undefined || decimals === undefined || tokenPrice === undefined
        ? BIG_ZERO
        : totalSupply.shiftedBy(-decimals).times(tokenPrice),
    );
  }

  const supplySiloApys = annualRewardsInUsd.map((v, i) => {
    const totalSupply = totalSuppliesInUsd[i];
    return totalSupply === undefined || totalSupply.isZero() ? BIG_ZERO : v.div(totalSupply);
  });

  return {
    supplyApys,
    supplySiloApys,
  };
};

const getLiquidStakingApys = async (pools: SiloPool[]) => {
  const liquidStakingAprs: number[] = [];

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i]!;
    if (pool.lsUrl) {
      //Normalize ls Data to always handle arrays
      //Coinbase's returned APR is already in %, we need to normalize it by multiplying by 100
      let lsAprFactor = 1;
      if (pool.lsAprFactor) lsAprFactor = pool.lsAprFactor!;

      let lsApr = 0;
      try {
        const url = pool.lsUrl!;
        const lsResponse: any = await fetch(url).then((res) => res.json());

        lsApr = jp.query(lsResponse, pool.dataPath!)[0];
        lsApr = (lsApr * lsAprFactor) / 100;
        liquidStakingAprs.push(lsApr);
      } catch {
        console.error(`Failed to fetch ${pool.name} liquid staking APR from ${pool.lsUrl}`);
      }
    } else {
      liquidStakingAprs.push(0);
    }
  }
  return liquidStakingAprs;
};

const getPoolsData = async (params: SiloApyParams): Promise<PoolsData> => {
  const siloTokenAbi = SiloTokenAbi;

  const supplyRateCalls = [];
  const rewardsPerSecondCalls = [];
  const totalSupplyCalls = [];
  const decimalsCalls = [];

  const pricePromises = params.pools.map((pool) => fetchPrice({ oracle: 'lps', id: pool.name }));

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i]!;
    const siloTokenContract = fetchContract(pool.address, siloTokenAbi, params.chainId);
    if (pool.vault) {
      supplyRateCalls.push(getVaultApy(pool, params.chainId));

      const incentivesControllerContract = fetchContract(
        pool.incentivesController,
        SiloV2IncentivesController,
        params.chainId,
      );
      if (pool.rewards) {
        for (const reward of pool.rewards) {
          rewardsPerSecondCalls.push(
            incentivesControllerContract.read.incentivesPrograms([reward.incentivesProgramId]),
          );
        }
      }
    } else if (pool.v2) {
      const lensContract = fetchContract(pool.lens, SiloV2Lens, params.chainId);
      supplyRateCalls.push(lensContract.read.getDepositAPR([pool.silo]));

      const incentivesControllerContract = fetchContract(
        pool.incentivesController,
        SiloV2IncentivesController,
        params.chainId,
      );
      if (pool.rewards) {
        for (const reward of pool.rewards) {
          rewardsPerSecondCalls.push(
            incentivesControllerContract.read.incentivesPrograms([reward.incentivesProgramId]),
          );
        }
      }
    } else {
      const lensContract = fetchContract(pool.lens, SiloLens, params.chainId);
      supplyRateCalls.push(lensContract.read.depositAPY([pool.silo, pool.underlying]));

      const incentivesControllerContract = fetchContract(
        pool.incentivesController,
        SiloIncentivesController,
        params.chainId,
      );
      rewardsPerSecondCalls.push(incentivesControllerContract.read.getAssetData([pool.address]));
    }

    totalSupplyCalls.push(siloTokenContract.read.totalSupply());
    decimalsCalls.push(siloTokenContract.read.decimals());
  }

  const res = await Promise.all([
    Promise.all(supplyRateCalls),
    Promise.all(rewardsPerSecondCalls),
    Promise.all(totalSupplyCalls),
    Promise.all(decimalsCalls),
    Promise.all(pricePromises),
  ]);

  const supplyRates: BigNumber[] = res[0].map((v) => new BigNumber(v.toString()));
  const rewardSpeeds: BigNumber[] = res[1].map((v) =>
    typeof v['1'] === 'string' ? new BigNumber(v['2'].toString()) : new BigNumber(v['1'].toString()),
  );
  const periodFinish: BigNumber[] = res[1].map((v) =>
    typeof v['1'] === 'string' ? new BigNumber(v['4'].toString()) : new BigNumber(0),
  );
  const totalSupplies: BigNumber[] = res[2].map((v) => new BigNumber(v.toString()));
  const decimals: number[] = res[3].map((v) => Number(v.toString()));

  const tokenPrices = res[4];

  return {
    tokenPrices,
    supplyRates,
    rewardSpeeds,
    periodFinish,
    totalSupplies,
    decimals,
  };
};

const getVaultApy = async (pool: SiloPool, chainId: ChainId) => {
  const vaultContract = fetchContract(pool.silo, SiloVault, chainId);
  const siloLensContract = fetchContract(pool.lens, SiloV2Lens, chainId);
  const supplyQueue = await vaultContract.read.supplyQueueLength();
  const totalAssets = new BigNumber((await vaultContract.read.totalAssets()).toString());

  let vaultApy = new BigNumber(0);

  for (let i = 0; i < supplyQueue; i++) {
    const silo = (await vaultContract.read.supplyQueue([BigInt(i)])) as `0x${string}`;
    const balance = (await vaultContract.read.balanceTracker([silo])).toString();
    let apy = new BigNumber(0);
    try {
      apy = new BigNumber((await siloLensContract.read.getDepositAPR([silo])).toString());
    } catch (e) {}

    vaultApy = vaultApy.plus(apy.times(balance));
  }

  return vaultApy.div(totalAssets);
};

export interface PoolsData {
  tokenPrices: number[];
  supplyRates: BigNumber[];
  rewardSpeeds: BigNumber[];
  periodFinish: BigNumber[];
  totalSupplies: BigNumber[];
  /** of the LP token, as X, not Xe18 */
  decimals: number[];
}

export interface SiloPool<T extends string = Hex> {
  name: string;
  address: T;
  silo: T;
  underlying: T;
  oracle?: string;
  oracleId: string;
  decimals: string;
  lsUrl?: string;
  lsAprFactor?: number;
  dataPath?: string;
  rewards?: Reward<T>[];
  rewardOracle?: string;
  rewardOracleId?: string;
  rewardDecimals?: string;
  incentivesController: string;
  lens: string;
  legacy?: boolean;
  collateral?: boolean;
  v2?: boolean;
  vault?: boolean;
  incentivesProgramId?: T;
  fee?: number;
}

export interface Reward<T extends string = Hex> {
  rewardOracle?: string;
  rewardOracleId: string;
  rewardDecimals: string;
  incentivesProgramId: T;
}

export interface SiloApyParams {
  chainId: ChainId;
  pools: SiloPool[];
  log?: boolean;
}

function validateHex(input: string): Hex {
  if (!isHex(input, { strict: true })) {
    throw new Error(`Invalid hex string: ${input}`);
  }
  return input;
}

function validateReward(reward: Reward<string>): Reward {
  return {
    ...reward,
    incentivesProgramId: validateHex(reward.incentivesProgramId),
  };
}

function validateRewards(rewards: Reward<string>[]): Reward[] {
  return rewards.map(validateReward);
}

function validateSiloPool(pool: SiloPool<string>): SiloPool {
  return {
    ...pool,
    address: getAddress(pool.address),
    silo: getAddress(pool.silo),
    underlying: getAddress(pool.underlying),
    incentivesProgramId: pool.incentivesProgramId ? validateHex(pool.incentivesProgramId) : undefined,
    rewards: pool.rewards ? validateRewards(pool.rewards) : undefined,
  };
}

export function validateSiloPools(pools: SiloPool<string>[]): SiloPool[] {
  return pools.map(validateSiloPool);
}
