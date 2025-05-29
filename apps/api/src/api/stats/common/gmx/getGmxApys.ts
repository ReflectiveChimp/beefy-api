import BigNumber from 'bignumber.js';
import type { ChainId } from 'blockchain-addressbook';
import StrategyABI from '../../../../abis/StrategyABI.js';
import DistributorAbi from '../../../../abis/arbitrum/Distributor.js';
import RewardTrackerAbi from '../../../../abis/arbitrum/RewardTracker.js';
import { fetchPrice, validOracleOrAny } from '../../../../utils/fetchPrice.js';
import { fetchContract } from '../../../rpc/client.js';
import getApyBreakdown, { type ApyBreakdownResult } from '../getApyBreakdown.js';
import { BIG_ZERO } from '../../../../utils/big-number.js';
import { getAddress } from 'viem';
import type { LpPool } from '../../../../types/LpPool.js';

type Pool = Omit<LpPool, 'strat' | 'oracleId'> & {
  oracleId: string;
  strat: string;
  glp?: boolean;
  stakedTracker: string;
};

export interface GmxApysParams {
  pools: Pool[];
  trackers: Tracker[];
  chainId: ChainId;
}

export interface Tracker {
  address: string;
  distributor: string;
  reward: Reward;
}

export interface Reward {
  symbol: string;
  decimals: string;
}

const SECONDS_PER_YEAR = 31536000;

export const getGmxCommonApys = async (params: GmxApysParams): Promise<ApyBreakdownResult> => {
  const farmAprs: BigNumber[] = await Promise.all(params.pools.map((pool) => getPoolApy(params, pool)));

  return getApyBreakdown(params.pools, {}, farmAprs, 0);
};

const getPoolApy = async (params: GmxApysParams, pool: Pool): Promise<BigNumber> => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(params, pool),
    getTotalStakedInUsd(params, pool),
  ]);
  return yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
};

const getYearlyRewardsInUsd = async (params: GmxApysParams, pool: Pool): Promise<BigNumber> => {
  const values = await Promise.all(params.trackers.map((tracker) => getTrackerRewards(params, pool, tracker)));
  return values.reduce((total, next) => total.plus(next), BIG_ZERO);
};

const getTrackerRewards = async (params: GmxApysParams, pool: Pool, tracker: GmxApysParams['trackers'][number]): Promise<BigNumber> => {
  const rewardTrackerContract = fetchContract(tracker.address, RewardTrackerAbi, params.chainId);
  const distributorContract = fetchContract(tracker.distributor, DistributorAbi, params.chainId);

  const res = await Promise.all([
    distributorContract.read.tokensPerInterval(),
    rewardTrackerContract.read.stakedAmounts([getAddress(pool.strat)]),
    rewardTrackerContract.read.totalSupply(),
  ]);

  const rewardPerSecond = new BigNumber(res[0].toString());
  const stakedAmounts = new BigNumber(res[1].toString());
  const totalSupply = new BigNumber(res[2].toString());

  let yearlyRewardsInUsd = new BigNumber(0);
  const price = await fetchPrice({
    oracle: 'tokens',
    id: tracker.reward.symbol,
  });
  yearlyRewardsInUsd = yearlyRewardsInUsd.plus(
    rewardPerSecond.times(SECONDS_PER_YEAR).times(price).dividedBy(tracker.reward.decimals),
  );

  return yearlyRewardsInUsd.times(stakedAmounts).dividedBy(totalSupply);
};

const getTotalStakedInUsd = async (params: GmxApysParams, pool: Pool): Promise<BigNumber> => {
  let staked: BigNumber;
  if (pool.glp) {
    const strategy = fetchContract(pool.strat, StrategyABI, params.chainId);
    staked = new BigNumber((await strategy.read.balanceOf()).toString());
  } else {
    const stakedTrackerContract = fetchContract(pool.stakedTracker, RewardTrackerAbi, params.chainId);
    staked = new BigNumber(
      (await stakedTrackerContract.read.depositBalances([getAddress(pool.strat), getAddress(pool.address)])).toString(),
    );
  }
  const stakedPrice = await fetchPrice({
    oracle: validOracleOrAny(pool.oracle),
    id: pool.oracleId,
  });
  return staked.times(stakedPrice).dividedBy(pool.decimals);
};
