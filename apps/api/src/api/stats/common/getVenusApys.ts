import BigNumber from 'bignumber.js';
import type { ChainId } from 'blockchain-addressbook';
import jp from 'jsonpath';
import VenusToken from '../../../abis/VenusToken.js';
import VenusComptrollerAbi from '../../../abis/arbitrum/VenusComptroller.js';
import VenusRewarderAbi from '../../../abis/arbitrum/VenusRewarder.js';
import { fetchPrice } from '../../../utils/fetchPrice.js';
import { fetchContract } from '../../rpc/client.js';
import getApyBreakdown from './getApyBreakdown.js';
import { BIG_ZERO } from '../../../utils/big-number.js';

type AngleResponse = {
  [id: string]: {
    id: string;
    chainId: number;
    status: string;
    apr: number;
    tvl: number;
    dailyrewards: number;
  }
}

const SECONDS_PER_YEAR = 31536000;

const getVenusApyData = async (params: VenusApyParams) => {
  const poolsData = await getPoolsData(params);

  const { supplyApys, supplyCompApys } = await getPoolsApys(params, poolsData);

  return getApyBreakdown(
    params.pools.map((p) => ({ ...p, address: p.name })),
    Object.fromEntries(params.pools.map((p, i) => [p.name, supplyApys[i] || BIG_ZERO])),
    supplyCompApys,
    0,
    poolsData.lsAprs,
    poolsData.merklAprs,
  );
};

const getPoolsApys = async (params: VenusApyParams, data: VenusPoolsData) => {
  const compPrice = await fetchPrice({
    oracle: 'tokens',
    id: params.compOracleId,
  });

  const supplyApys = data.supplyRates.map((v) => v.times(SECONDS_PER_YEAR).div('1e18'));

  const annualCompSupplyInUsd = data.compSupplySpeeds.map((v) =>
    v.times(SECONDS_PER_YEAR).div('1e18').times(compPrice),
  );

  const totalSuppliesInUsd = data.totalSupplies.map((v, i) =>
    // TODO check index exists
    v.times(data.exchangeRatesStored[i]!).div('1e18').div(params.pools[i]!.decimals).times(data.tokenPrices[i]!),
  );

  // TODO check index exists
  const supplyCompApys = annualCompSupplyInUsd.map((v, i) => v.div(totalSuppliesInUsd[i]!));

  return {
    supplyApys,
    supplyCompApys,
  };
};

const getPoolsData = async (params: VenusApyParams): Promise<VenusPoolsData> => {
  const comptrollerContract = fetchContract(params.comptroller, VenusComptrollerAbi, params.chainId);
  const distributor = await comptrollerContract.read.getRewardDistributors();
  // TODO check index exists
  const distributorContract = fetchContract(distributor[0]!.toString(), VenusRewarderAbi, params.chainId);

  const supplyRateCalls: Promise<bigint>[] = [];
  const compSpeedCalls: Promise<bigint>[] = [];
  const totalSupplyCalls: Promise<bigint>[] = [];
  const exchangeRateStoredCalls: Promise<bigint>[] = [];

  const pricePromises = params.pools.map((pool) => fetchPrice({ oracle: 'tokens', id: pool.oracleId }));
  const lsAprCalls = params.pools.map((pool) => getLiquidStakingApy(pool));

  params.pools.forEach((pool) => {
    const cTokenContract = fetchContract(pool.cToken, VenusToken, params.chainId);
    supplyRateCalls.push(cTokenContract.read.supplyRatePerBlock());
    compSpeedCalls.push(distributorContract.read.rewardTokenSupplySpeeds([pool.cToken as `0x${string}`]));
    totalSupplyCalls.push(cTokenContract.read.totalSupply());
    exchangeRateStoredCalls.push(cTokenContract.read.exchangeRateStored());
  });
  const res = await Promise.all([
    Promise.all(supplyRateCalls),
    Promise.all(compSpeedCalls),
    Promise.all(totalSupplyCalls),
    Promise.all(exchangeRateStoredCalls),
    Promise.all(pricePromises),
    Promise.all(lsAprCalls),
  ]);

  const supplyRates: BigNumber[] = res[0].map((v) => new BigNumber(v.toString()));
  const compSupplySpeeds: BigNumber[] = res[1].map((v) => new BigNumber(v.toString()));
  const totalSupplies: BigNumber[] = res[2].map((v) => new BigNumber(v.toString()));
  const exchangeRatesStored: BigNumber[] = res[3].map((v) => new BigNumber(v.toString()));
  const tokenPrices = res[4];
  const lsAprs = res[5];

  let merklPools: AngleResponse;
  if (params.pools.some((p) => p.merkl)) {
    const chainId = params.chainId;
    const merklApi = `https://api.angle.money/v3/opportunity?chainId=${chainId}`;
    try {
      merklPools = (await fetch(merklApi).then((res) => res.json())) as AngleResponse;
    } catch (e) {
      console.error(`Failed to fetch Merkl APRs: ${chainId}`);
      merklPools = {};
    }
  }

  const merklAprs = params.pools.map((pool) => {
    if (Object.keys(merklPools).length !== 0 && pool.merkl) {
      for (const [key, value] of Object.entries(merklPools)) {
        const typedValue = value as MerklValue;
        if (key.toLowerCase() === `1_${pool.cToken.toLowerCase()}`) {
          return (typedValue.dailyrewards * 365) / typedValue.tvl;
        }
      }
    }
  });

  return {
    tokenPrices,
    supplyRates,
    compSupplySpeeds,
    lsAprs,
    merklAprs,
    totalSupplies,
    exchangeRatesStored,
  };
};

const getLiquidStakingApy = async (pool: VenusPool) => {
  let liquidStakingApr = 0;

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
      liquidStakingApr = lsApr;
    } catch {
      console.error(`Failed to fetch ${pool.name} liquid staking APR from ${pool.lsUrl}`);
    }
  }
  return liquidStakingApr;
};

export interface VenusPoolsData {
  tokenPrices: number[];
  supplyRates: BigNumber[];
  compSupplySpeeds: BigNumber[];
  lsAprs: number[];
  merklAprs: (number|undefined)[];
  totalSupplies: BigNumber[];
  exchangeRatesStored: BigNumber[];
}

export interface VenusPool {
  name: string;
  cToken: string;
  oracleId: string;
  decimals: string;
  lsUrl?: string;
  lsAprFactor?: number;
  dataPath?: string;
  merkl?: boolean;
}

export interface VenusApyParams {
  chainId: ChainId;
  comptroller: string;
  compOracleId: string;
  pools: VenusPool[];
}

type MerklValue = {
  dailyrewards: number;
  tvl: number;
};

export default getVenusApyData;
