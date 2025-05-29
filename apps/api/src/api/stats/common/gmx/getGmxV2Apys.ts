import type { NormalizedCacheObject } from '@apollo/client/core';
import type { ApolloClient } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import ERC20Abi from '../../../../abis/ERC20Abi.js';
import type { LpPool } from '../../../../types/LpPool.js';
import { fetchPrice } from '../../../../utils/fetchPrice.js';
import { getGmxTradingFeeApr } from '../../../../utils/getTradingFeeApr.js';
import { fetchContract } from '../../../rpc/client.js';
import getApyBreakdown, { type ApyBreakdownResult } from '../getApyBreakdown.js';
import { BIG_ZERO } from '../../../../utils/big-number.js';

export interface GmxV2ApysParams {
  pools: LpPool[];
  tradingFeeInfoClient: ApolloClient<NormalizedCacheObject>;
  chainId: number;
  url: string;
  rewardId: string;
}

type ApiIncentivesResponse = {
  lp: {
    isActive: boolean;
    totalRewards: string;
    period: number;
    rewardsPerMarket: {
      [address: string]: string;
    };
  };
  migration: {
    isActive: boolean;
    maxRebateBps: number;
    period: number;
  };
  trading: {
    isActive: boolean;
    rebatePercent: number;
    allocation: string;
    period: number;
  };
};

export const getGmxV2CommonApys = async (params: GmxV2ApysParams): Promise<ApyBreakdownResult> => {
  const tradingAprs = await getTradingApr(params);
  const incentives = await getIncentives(params.url);
  const farmAprs = await Promise.all(params.pools.map(pool => getPoolApy(params, pool, incentives)));

  return getApyBreakdown(params.pools, tradingAprs, farmAprs, 0);
};

const getTradingApr = async (params: GmxV2ApysParams) => {
  const client = params.tradingFeeInfoClient;
  const marketAddresses = params.pools.map((pool) => pool.address);
  const aprs = await getGmxTradingFeeApr(client, marketAddresses);
  return aprs;
};

const getIncentives = async (url: string) => {
  try {
    const incentives = await fetch(url).then(async (res) => (await res.json()) as ApiIncentivesResponse);
    return incentives.lp.rewardsPerMarket;
  } catch (err) {
    console.error('GMX APY error ', url);
  }
};

const getPoolApy = async (params: GmxV2ApysParams, pool: LpPool, incentives?: ApiIncentivesResponse['lp']['rewardsPerMarket']): Promise<BigNumber> => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(params, pool, incentives),
    getTotalStakedInUsd(params, pool),
  ]);
  return yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
};

const getYearlyRewardsInUsd = async (params: GmxV2ApysParams, pool: LpPool, incentives?: ApiIncentivesResponse['lp']['rewardsPerMarket']): Promise<BigNumber> => {
  const rewardPrice = await fetchPrice({
    oracle: 'tokens',
    id: params.rewardId,
  });
  const incentive = incentives?.[pool.address];
  if (!incentive) {
    return BIG_ZERO;
  }
  return new BigNumber(incentive).dividedBy('1e18').times(rewardPrice).dividedBy(7).times(365);
};

const getTotalStakedInUsd = async (params: GmxV2ApysParams, pool: LpPool): Promise<BigNumber> => {
  const marketContract = fetchContract(pool.address, ERC20Abi, params.chainId);
  const staked = new BigNumber((await marketContract.read.totalSupply()).toString());
  const stakedPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
  return staked.times(stakedPrice).dividedBy('1e18');
};
