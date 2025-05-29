import type { NormalizedCacheObject } from '@apollo/client/core';
import type { ApolloClient } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import type { ChainId } from 'blockchain-addressbook';
import type { Abi } from 'viem';
import ERC20Abi from '../../../abis/ERC20Abi.js';
import MasterChef from '../../../abis/MasterChef.js';
import { isBeetClient, isSushiClient } from '../../../apollo/client.js';
import type { LpPool, SingleAssetPool } from '../../../types/LpPool.js';
import { fetchPrice } from '../../../utils/fetchPrice.js';
import getBlockNumber from '../../../utils/getBlockNumber.js';
import getBlockTime from '../../../utils/getBlockTime.js';
import {
  getTradingFeeApr,
  getTradingFeeAprBalancerFTM,
  getTradingFeeAprSushi,
} from '../../../utils/getTradingFeeApr.js';
import { fetchContract } from '../../rpc/client.js';
import getApyBreakdown, { type ApyBreakdownResult } from './getApyBreakdown.js';

export interface MasterChefApysParams {
  chainId: ChainId;
  masterchef: string;
  masterchefAbi?: Abi;
  tokenPerBlock: string;
  hasMultiplier: boolean;
  useMultiplierTimestamp?: boolean;
  singlePools?: SingleAssetPool[];
  pools?: LpPool[] | (LpPool | SingleAssetPool)[];
  oracle: string;
  oracleId: string;
  decimals: string;
  tradingFeeInfoClient?: ApolloClient<NormalizedCacheObject>;
  liquidityProviderFee?: number;
  log?: boolean;
  tradingAprs?: {
    [x: string]: any;
  };
  secondsPerBlock?: number;
  allocPointIndex?: string;
  burn?: number;
}

export const getMasterChefApys = async (
  masterchefParams: MasterChefApysParams,
): Promise<ApyBreakdownResult> => {
  masterchefParams.pools = [...(masterchefParams.pools ?? []), ...(masterchefParams.singlePools ?? [])];

  const tradingAprs = await getTradingAprs(masterchefParams);
  const farmApys = await getFarmApys(masterchefParams);

  const liquidityProviderFee = masterchefParams.liquidityProviderFee ?? 0.003;

  return getApyBreakdown(masterchefParams.pools, tradingAprs, farmApys, liquidityProviderFee);
};

const getTradingAprs = async (params: MasterChefApysParams) => {
  let tradingAprs = params.tradingAprs ?? {};
  const client = params.tradingFeeInfoClient;
  const fee = params.liquidityProviderFee;
  if (client && fee) {
    const pairAddresses = params.pools.map((pool) => pool.address.toLowerCase());
    const getAprs = isSushiClient(client)
      ? getTradingFeeAprSushi
      : isBeetClient(client)
        ? getTradingFeeAprBalancerFTM
        : getTradingFeeApr;
    const aprs = await getAprs(client, pairAddresses, fee);
    tradingAprs = { ...tradingAprs, ...aprs };
  }
  return tradingAprs;
};

const getFarmApys = async (params: MasterChefApysParams): Promise<BigNumber[]> => {
  const apys: BigNumber[] = [];

  const tokenPrice = await fetchPrice({
    oracle: params.oracle,
    id: params.oracleId,
  });

  const [{ multiplier, blockRewards, totalAllocPoint }, { balances, allocPoints }, secondsPerBlock] =
    await Promise.all([getMasterChefData(params), getPoolsData(params), fetchBlockTime(params)]);

  if (params.log) {
    console.log(
      params.tokenPerBlock,
      blockRewards.div(params.decimals).toNumber(),
      'secondsPerBlock',
      secondsPerBlock,
      totalAllocPoint.toNumber(),
    );
  }

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];

    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const poolBlockRewards = blockRewards
      .times(multiplier)
      .times(allocPoints[i])
      .dividedBy(totalAllocPoint)
      .times(1 - (pool.depositFee ?? 0));

    const secondsPerYear = 31536000;
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    let yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(params.decimals);

    if (params.burn) {
      yearlyRewardsInUsd = yearlyRewardsInUsd.times(1 - params.burn);
    }

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
    if (params.log) {
      console.log(pool.name, apy.toNumber(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
    }
  }

  return apys;
};

const fetchBlockTime = async (params: MasterChefApysParams) => {
  return params.secondsPerBlock ?? (await getBlockTime(params.chainId));
};

const getMasterChefData = async (params: MasterChefApysParams) => {
  const abi = params.masterchefAbi ?? chefAbi(params.tokenPerBlock);
  const masterchefContract = fetchContract(params.masterchef, abi, params.chainId);
  let multiplier = new BigNumber(1);

  if (params.hasMultiplier) {
    const blockNum = await getBlockNumber(params.chainId);
    const period = params.useMultiplierTimestamp ? Math.floor(Date.now() / 1000) : blockNum;
    multiplier = new BigNumber(
      (await masterchefContract.read.getMultiplier([period - 1, period])).toString(),
    );
  }
  const blockRewards = new BigNumber((await masterchefContract.read[params.tokenPerBlock]()).toString());
  const totalAllocPoint = new BigNumber((await masterchefContract.read.totalAllocPoint()).toString());
  return { multiplier, blockRewards, totalAllocPoint };
};

const getPoolsData = async (params: MasterChefApysParams) => {
  const abi = params.masterchefAbi ?? chefAbi(params.tokenPerBlock);
  const masterchefContract = fetchContract(params.masterchef, abi, params.chainId);
  const balanceCalls = [];
  const allocPointCalls = [];
  params.pools.forEach((pool) => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, params.chainId);
    balanceCalls.push(tokenContract.read.balanceOf([(pool.strat ?? params.masterchef) as `0x${string}`]));
    allocPointCalls.push(masterchefContract.read.poolInfo([pool.poolId]));
  });

  const [balanceResults, allocPointResults] = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(allocPointCalls),
  ]);

  const balances: BigNumber[] = balanceResults.map((v) => new BigNumber(v.toString()));
  const allocPoints: BigNumber[] = allocPointResults.map(
    (v) => new BigNumber(v[params.allocPointIndex ?? '1'].toString()),
  );
  return { balances, allocPoints };
};

const chefAbi = (tokenPerBlock): Abi => {
  const cakeAbi = [
    ...MasterChef,
    {
      inputs: [],
      name: tokenPerBlock,
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ] as const;

  return cakeAbi;
};
