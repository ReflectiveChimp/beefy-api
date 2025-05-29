import BigNumber from 'bignumber.js';
import IStargateMasterchef from '../../../../abis/IStargateMasterchef.js';
import IStargateRewarder from '../../../../abis/IStargateRewarder.js';
import { fetchPrice, validOracleOrAny } from '../../../../utils/fetchPrice.js';
import { fetchContract } from '../../../rpc/client.js';
import getApyBreakdown, { type ApyBreakdownResult } from '../getApyBreakdown.js';
import { ChainId } from 'blockchain-addressbook';
import { type Address, getAddress } from 'viem';

type RewardDetails = {
  address: string;
  oracleId: string;
  decimals: string;
};

type Reward = {
  rewardDetail: RewardDetails;
  rewardPerSec: BigNumber;
};

type PoolRewards = {
  rewards: Reward[];
};

type Pool = {
  name: string;
  address: string;
  oracle?: string;
  oracleId?: string;
  decimals?: string;
  rewarder: string;
  rewards: RewardDetails[];
}

type Params = {
  chainId: ChainId;
  masterchef: string;
  pools: Pool[];
  log?: boolean;
}

export const getStargateV2Apys = async (params: Params): Promise<ApyBreakdownResult> => {
  const farmApys = await getFarmApys(params);
  return getApyBreakdown(params.pools, {}, farmApys, 0);
};

const getFarmApys = async (params: Params): Promise<BigNumber[]> => {
  const apys: BigNumber[] = [];

  const [{ balances, poolRewards }] = await Promise.all([getPoolsData(params)]);

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i]!;
    const oracle = validOracleOrAny(pool.oracle ?? 'lps');
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    // TODO check [i] exists
    const totalStakedInUsd = balances[i]!.times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const secondsPerYear = 31536000;
    let yearlyRewardsInUsd = new BigNumber(0);
    // TODO check [i] exists
    for (let j = 0; j < poolRewards[i]!.rewards.length; j++) {
      // TODO check [j] exists
      const reward = poolRewards[i]!.rewards[j]!;
      const rewardPrice = await fetchPrice({
        oracle: 'tokens',
        id: reward.rewardDetail.oracleId,
      });
      const yearlyRewards = reward.rewardPerSec.times(secondsPerYear);
      yearlyRewardsInUsd = yearlyRewardsInUsd.plus(
        yearlyRewards.times(rewardPrice).dividedBy(reward.rewardDetail.decimals),
      );
    }

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
    if (params.log) {
      console.log(pool.name, apy.toNumber(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
    }
  }

  return apys;
};

const getPoolsData = async (params: Params) => {
  const masterchefContract = fetchContract(params.masterchef, IStargateMasterchef, params.chainId);
  const balanceCalls: Promise<bigint>[] = [];
  params.pools.forEach((pool) => {
    balanceCalls.push(masterchefContract.read.totalSupply([getAddress(pool.address)]));
  });

  const [balanceResults] = await Promise.all([Promise.all(balanceCalls)]);
  const balances: BigNumber[] = balanceResults.map((v) => new BigNumber(v.toString()));

  const rewardDetailsCalls: Promise<{rewardPerSec: bigint; totalAllocPoints: bigint; end: number}>[] = [];
  const allocPointsByStakedCalls: Promise<readonly [readonly string[], readonly number[]]>[] = [];
  params.pools.forEach((pool) => {
    const rewarderContract = fetchContract(pool.rewarder, IStargateRewarder, params.chainId);
    allocPointsByStakedCalls.push(rewarderContract.read.allocPointsByStake([getAddress(pool.address)]));
    pool.rewards.forEach((reward) => {
      rewardDetailsCalls.push(rewarderContract.read.rewardDetails([getAddress(reward.address)]));
    });
  });

  const [allocPointsByStakedResults, rewardDetailsResults] = await Promise.all([
    Promise.all(allocPointsByStakedCalls),
    Promise.all(rewardDetailsCalls),
  ]);
  const totalRewardPerSec: BigNumber[] = rewardDetailsResults.map((v) => new BigNumber(v.rewardPerSec));
  const totalAllocPoints: BigNumber[] = rewardDetailsResults.map((v) => new BigNumber(v.totalAllocPoints));
  const periodFinishes: BigNumber[] = rewardDetailsResults.map((v) => new BigNumber(v.end));
  const poolRewards: PoolRewards[] = [];

  let i = 0;
  params.pools.forEach((pool, poolIndex) => {
    poolRewards.push({ rewards: [] });
    pool.rewards.forEach((reward) => {
      // TODO check index exists
      const allocPointIndex = allocPointsByStakedResults[poolIndex]![0].indexOf(reward.address);
      if (allocPointIndex != -1) {
        // TODO check index exists
        const allocPoint = new BigNumber(allocPointsByStakedResults[poolIndex]![1]![allocPointIndex]!);
        let rewardPerSec = new BigNumber(0);
        // TODO check index exists
        if (periodFinishes[i]! > new BigNumber(Date.now() / 1000)) {
          // TODO check index exists
          rewardPerSec = totalRewardPerSec[i]!.times(allocPoint).dividedBy(totalAllocPoints[i]!);
        }
        // TODO check index exists
        poolRewards[poolIndex]!.rewards.push({
          rewardDetail: reward,
          rewardPerSec: rewardPerSec,
        });
      }
      i++;
    });
  });

  return { balances, poolRewards };
};
