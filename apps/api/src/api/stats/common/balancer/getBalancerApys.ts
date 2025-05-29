import type { ApolloClient, NormalizedCacheObject } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import { getBalTradingAndLstApr } from '../../../../utils/getBalancerTradingFeeAndLstApr.js';
import { getTotalStakedInUsd, getYearlyRewardsInUsd } from '../curve/getCurveApyData.js';
import { type ApyBreakdownResult, getApyBreakdown } from '../getApyBreakdown.js';
import { ChainId } from 'blockchain-addressbook';

interface Token {
  newGauge?: boolean;
  oracle?: string;
  oracleId: string;
  decimals?: string;
}

interface Underlying {
  address: string;
  index: number;
  poolId?: string;
  bbIndex?: number;
}

interface Pool {
  name: string;
  address: string;
  tokens: Token[];
  beefyFee?: number;
  status?: string;
  lsIndex?: number;
  cmpIndex?: number;
  composable?: boolean;
  bptIndex?: number;
  vaultPoolId?: string;
  lsUrl?: string;
  lsAprFactor?: number | number[];
  dataPath?: string;
  balancerChargesFee?: boolean;
  includesComposableAaveTokens?: boolean;
  aaveUnderlying?: Underlying[];
  bbPoolId?: string;
  bbIndex?: number;
  composableSplit?: boolean;
  merkl?: boolean;
}

interface BalancerParams {
  chainId: number;
  client: ApolloClient<NormalizedCacheObject>;
  pools: Pool[];
  balancerVault: string;
  aaveDataProvider: string;
  log?: boolean;
}

type MerklValue = {
  dailyrewards: number;
  tvl: number;
};

const liquidityProviderFee = 0.0025;

export const getBalancerApys = async (params: BalancerParams): Promise<ApyBreakdownResult> => {
  const pairAddresses = params.pools.map((pool) => pool.address);

  const [tradingAprs, farmApys] = await Promise.all([
    getTradingFeeAprBalancer(params.chainId, pairAddresses),
    getPoolApys(params),
  ]);

  return getApyBreakdown(
    params.pools,
    tradingAprs.tradingAprMap as Record<string, BigNumber>,
    farmApys,
    liquidityProviderFee,
    tradingAprs.lstAprs,
  );
};

const getTradingFeeAprBalancer = async (chainId: ChainId, pairAddresses: string[]) => {
  const data = await getBalTradingAndLstApr(chainId, pairAddresses);
  return data;
};

const getPoolApys = async (params: BalancerParams) => {
  const apys: BigNumber[] = [];

  const poolApyCalls = params.pools.map((pool, i) => getPoolApy(pool, params));
  const poolApyResults = await Promise.all(poolApyCalls);

  poolApyResults.forEach((result) => {
    apys.push(result);
  });

  return apys;
};

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

const getPoolApy = async (pool: Pool, params: BalancerParams) => {
  if (pool.status === 'eol') return new BigNumber(0);
  let rewardsApy: BigNumber = new BigNumber(0);
  if (pool.merkl) {
    const chainId = params.chainId;
    const merklApi = `https://api.angle.money/v3/opportunity?chainId=${chainId}`;
    try {
      // TODO only fetch once per chain rather than once per pool
      const merklPools = (await fetch(merklApi).then((res) => res.json())) as AngleResponse;
      if (Object.keys(merklPools).length !== 0) {
        for (const [key, value] of Object.entries(merklPools)) {
          if (key.toLowerCase() === `1_${pool.address.toLowerCase()}`) {
            rewardsApy = new BigNumber((value.dailyrewards * 365) / value.tvl);
          }
        }
      }
    } catch (e) {
      console.error(`Failed to fetch Merkl APRs: ${chainId}`);
    }

    return rewardsApy;
  }

  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(params.chainId, pool),
    getTotalStakedInUsd(params.chainId, pool),
  ]);

  rewardsApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  if (params.log) {
    console.log(pool.name, rewardsApy.toNumber(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  }

  return rewardsApy;
};
