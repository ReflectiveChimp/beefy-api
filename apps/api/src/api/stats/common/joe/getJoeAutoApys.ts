import BigNumber from 'bignumber.js';
import ERC20Abi from '../../../../abis/ERC20Abi.js';
import ISimpleRewarder from '../../../../abis/ISimpleRewarder.js';
import abi from '../../../../abis/arbitrum/JoeAutoFarm.js';
import { fetchPrice, type PriceOracle, validOracleOrAny } from '../../../../utils/fetchPrice.js';
import { fetchContract } from '../../../rpc/client.js';
import getApyBreakdown, { type ApyBreakdownResult } from '../getApyBreakdown.js';
import { errorToString } from '../../../../utils/error.js';
import type { Address } from 'viem';
import { ChainId } from 'blockchain-addressbook';

const baseApyUrl = 'https://barn.traderjoexyz.com/v1/vaults';

type JoeVault = {
  address: string;
  apr1d: number;
};

type JoeVaultsResponse = JoeVault[];

type PoolReward = {
  oracleId: string;
  decimals: string;
  rewarder: string;
}

type Pool = {
  name: string;
  address: string;
  oracle?: string;
  oracleId?: string;
  decimals?: string;
  tradingFee?: number;
  rewards?: PoolReward[];
  poolId: number;
}

type Params = {
  pools: Pool[];
  oracle: PriceOracle;
  oracleId: string;
  decimals: string;
  masterchef: Address;
  chainId: ChainId;
  log?: boolean;
}

export const getJoeAutoApys = async (joeAutoParams: Params): Promise<ApyBreakdownResult> => {
  const tradingAprs = await getTradingAprs(joeAutoParams);
  const farmApys = await getFarmApys(joeAutoParams);
  const providerFee = joeAutoParams.pools.map((pool) => new BigNumber(pool.tradingFee ?? 0));

  return getApyBreakdown(joeAutoParams.pools, tradingAprs, farmApys, providerFee);
};

const getTradingAprs = async (params: Params): Promise<Record<string, BigNumber>> => {
  const poolMap: Record<string, BigNumber> = {};
  const pools = params.pools.map((pool) => pool.address.toLowerCase());
  try {
    const fetchJoeApy = fetch(baseApyUrl, {
      headers: {
        accept: 'application/json',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
      },
      referrer: 'https://traderjoexyz.com/',
    });
    const response = (await fetchJoeApy.then((res) => res.json())) as JoeVaultsResponse;
    pools.forEach((pool) => {
      const poolData = response.find((data) => data.address == pool);
      if (poolData) {
        poolMap[pool] = new BigNumber(poolData.apr1d);
      }
      else {
        console.warn(`No pool data found for ${pool}`);
      }
    });
  } catch (err) {
    console.error('Joe Auto base apy error ', baseApyUrl, errorToString(err));
  }
  return poolMap;
};

const getFarmApys = async (params: Params): Promise<BigNumber[]> => {
  const apys: BigNumber[] = [];

  const tokenPrice = await fetchPrice({
    oracle: params.oracle,
    id: params.oracleId,
  });

  const [{ balances, rewardPerSecs, extraRewardPerSecs }] = await Promise.all([getPoolsData(params)]);

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i]!;

    const oracle = validOracleOrAny(pool.oracle ?? 'lps');
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    // TODO check [i] exists
    const totalStakedInUsd = balances[i]!.times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const secondsPerYear = 31536000;
    // TODO check [i] exists
    const yearlyRewards = rewardPerSecs[i]!.times(secondsPerYear);
    let yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(params.decimals);
    let extraYearlyRewardsInUsd = new BigNumber(0);

    for (const extra of extraRewardPerSecs.filter((e) => e.pool === pool.name)) {
      const rewardPrice = await fetchPrice({
        oracle: 'tokens',
        id: extra.oracleId,
      });
      const extraYearlyRewards = extra.rewardRate.times(secondsPerYear);
      extraYearlyRewardsInUsd = extraYearlyRewardsInUsd.plus(
        extraYearlyRewards.times(rewardPrice).dividedBy(extra.decimals),
      );
    }

    yearlyRewardsInUsd = yearlyRewardsInUsd.plus(extraYearlyRewardsInUsd);

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
    if (params.log) {
      console.log(pool.name, apy.toNumber(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
    }
  }

  return apys;
};

const getPoolsData = async (params: Params) => {
  const masterchefContract = fetchContract(params.masterchef, abi, params.chainId);
  const balanceCalls:Promise<bigint>[] = [];
  const rewardPerSecCalls: Promise<{
    apToken: `0x${string}`;
    accJoePerShare: bigint;
    lastRewardTimestamp: bigint;
    joePerSec: bigint;
    rewarder: `0x${string}`;
  }>[] = [];
  const extraData: Array<{pool: string; oracleId: string; decimals: string;}> = [];
  const extraRewardPerSecCalls: Promise<bigint>[] = [];
  params.pools.forEach((pool) => {
    (pool.rewards ?? []).forEach((reward) => {
      extraData.push({
        pool: pool.name,
        oracleId: reward.oracleId,
        decimals: reward.decimals,
      });
      const rewarderContract = fetchContract(reward.rewarder, ISimpleRewarder, params.chainId);
      extraRewardPerSecCalls.push(rewarderContract.read.tokenPerSec());
    });

    const tokenContract = fetchContract(pool.address, ERC20Abi, params.chainId);
    balanceCalls.push(tokenContract.read.balanceOf([params.masterchef as `0x${string}`]));
    rewardPerSecCalls.push(masterchefContract.read.farmInfo([BigInt(pool.poolId)]));
  });

  const [balanceResults, rewardPerSecResults, extraRewardPerSecResults] = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(rewardPerSecCalls),
    Promise.all(extraRewardPerSecCalls),
  ]);

  const balances: BigNumber[] = balanceResults.map((v) => new BigNumber(v.toString()));
  const rewardPerSecs: BigNumber[] = rewardPerSecResults.map((v) => new BigNumber(v.joePerSec.toString()));

  const extraRewardPerSecs = extraData.map((data, index) => ({
    ...data,
    // TODO check [index] existsØ
    rewardRate: new BigNumber(extraRewardPerSecResults[index]!.toString()),
  }));
  return { balances, rewardPerSecs, extraRewardPerSecs };
};
