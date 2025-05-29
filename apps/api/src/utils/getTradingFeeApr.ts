import type { ApolloClient, NormalizedCacheObject } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import {
  type BaseSwapResult,
  type GmxResult,
  type HopResult,
  type JoeDayDataRangeResult,
  type PairDayDataResult,
  type PairDayDataSushiResult,
  type PairDayDataSushiTridentResult,
  type PairDayDataVariables,
  type PoolsDataResult,
  type ProtocolDayDataRangeResult,
  balancerDataQuery,
  baseSwapQuery,
  dayDataQuery,
  gmxQuery,
  hopQuery,
  joeDayDataQuery,
  joeDayDataRangeQuery,
  pairDayDataQuery,
  pairDayDataSushiQuery,
  pairDayDataSushiTridentQuery,
  poolsDataQuery,
  protocolDayDataRangeQuery,
} from '../apollo/queries.js';
import getBlockNumber from './getBlockNumber.js';
import getBlockTime from './getBlockTime.js';
import { getUtcSecondsFromDayRange } from './getUtcSecondsFromDayRange.js';

export const getTradingFeeApr = async (
  client: ApolloClient<NormalizedCacheObject>,
  pairAddresses: string[],
  liquidityProviderFee: number,
) => {
  const [start, end] = getUtcSecondsFromDayRange(1, 2);
  const pairAddressToAprMap: Record<string, BigNumber> = {};

  try {
    const {
      data: { pairDayDatas },
    } = await client.query<PairDayDataResult, PairDayDataVariables>({
      query: pairDayDataQuery,
      variables: {
        pairs: addressesToLowercase(pairAddresses),
        start,
        end,
      },
    });

    for (const pairDayData of pairDayDatas) {
      const pairAddress = pairDayData.id.split('-')[0]!.toLowerCase();
      pairAddressToAprMap[pairAddress] = new BigNumber(pairDayData.dailyVolumeUSD)
        .times(liquidityProviderFee)
        .times(365)
        .dividedBy(pairDayData.reserveUSD);
    }
  } catch (e) {
    // console.error('> getTradingFeeApr error', pairAddresses[0]);
  }

  return pairAddressToAprMap;
};

export const getTradingFeeAprSushi = async (
  client: ApolloClient<NormalizedCacheObject>,
  pairAddresses: string[],
  liquidityProviderFee: number,
) => {
  const [start0, end0] = getUtcSecondsFromDayRange(1, 2);
  const [start1, end1] = getUtcSecondsFromDayRange(3, 4);
  const pairAddressToAprMap: Record<string, BigNumber> = {};

  try {
    const [queryResponse0, queryResponse1] = await Promise.all([
      client.query<PairDayDataSushiResult>({
        query: pairDayDataSushiQuery(addressesToLowercase(pairAddresses), start0, end0),
      }),
      client.query<PairDayDataSushiResult>({
        query: pairDayDataSushiQuery(addressesToLowercase(pairAddresses), start1, end1),
      }),
    ]);

    const pairDayDatas = queryResponse0.data.pairs.map((pair, i) => ({
      newer: pair.dayData[0],
      older: queryResponse1.data.pairs[i]?.dayData[0],
    }));

    for (const { newer, older } of pairDayDatas) {
      if (newer && older) {
        const pairAddress = newer.id.split('-')[0]!.toLowerCase();
        const avgVol = new BigNumber(newer.volumeUSD).plus(older.volumeUSD).dividedBy(2);
        const avgReserve = new BigNumber(newer.reserveUSD).plus(older.reserveUSD).dividedBy(2);
        pairAddressToAprMap[pairAddress] = new BigNumber(avgVol)
          .times(liquidityProviderFee)
          .times(365)
          .dividedBy(avgReserve);
      }
    }
  } catch (e) {
    // console.error('> getTradingFeeAprSushi error', pairAddresses[0]);
  }

  return pairAddressToAprMap;
};

export const getTradingFeeAprSushiTrident = async (
  client: ApolloClient<NormalizedCacheObject>,
  pairAddresses: string[],
  liquidityProviderFee: number,
) => {
  const [start0, end0] = getUtcSecondsFromDayRange(1, 2);
  const [start1, end1] = getUtcSecondsFromDayRange(3, 4);
  const pairAddressToAprMap: Record<string, BigNumber> = {};

  try {
    const queryResponse0 = await client.query<PairDayDataSushiTridentResult>({
      query: pairDayDataSushiTridentQuery(addressesToLowercase(pairAddresses), start0, end0),
    });

    const queryResponse1 = await client.query<PairDayDataSushiTridentResult>({
      query: pairDayDataSushiTridentQuery(addressesToLowercase(pairAddresses), start1, end1),
    });

    const pairDayDatas = queryResponse0.data.pairDaySnapshots.map((pair, i) => ({
      newer: pair,
      older: queryResponse1.data.pairDaySnapshots[i],
    }));

    for (const { newer, older } of pairDayDatas) {
      if (newer && older) {
        const pairAddress = newer.id.split('-')[0]!.toLowerCase();
        const avgVol = new BigNumber(newer.volumeUSD).plus(older.volumeUSD).dividedBy(2);
        const avgReserve = new BigNumber(newer.liquidityUSD).plus(older.liquidityUSD).dividedBy(2);
        pairAddressToAprMap[pairAddress] = new BigNumber(avgVol)
          .times(liquidityProviderFee)
          .times(365)
          .dividedBy(avgReserve);
      }
    }
  } catch (e) {
    // console.error('> getTradingFeeAprSushiTrident error', pairAddresses[0]);
  }

  return pairAddressToAprMap;
};

export const getTradingFeeAprBalancer = async (
  client: ApolloClient<NormalizedCacheObject>,
  pairAddresses: string[],
  liquidityProviderFee: number,
  chainId: number,
) => {
  const [blockTime, currentBlock] = await Promise.all([getBlockTime(chainId), getBlockNumber(chainId)]);
  const pastBlock = Math.floor(currentBlock - 86400 / blockTime);
  const pairAddressesToAprMap: Record<string, BigNumber> = {};

  try {
    const queryCurrent = await client.query<PoolsDataResult>({
      query: poolsDataQuery(addressesToLowercase(pairAddresses), currentBlock - 600),
    });

    const queryPast = await client.query<PoolsDataResult>({
      query: poolsDataQuery(addressesToLowercase(pairAddresses), pastBlock - 600),
    });

    const poolDayDatas0 = queryCurrent.data.pools;
    const poolDayDatas1 = queryPast.data.pools;

    for (const pool of poolDayDatas0) {
      const pair = pool.address.toLowerCase();
      const pastPool = poolDayDatas1.filter((p) => {
        return p.address === pool.address;
      })[0];
      if (!pastPool) {
        throw new Error(`${pool.address} not found`);
      }

      pairAddressesToAprMap[pair] = new BigNumber(pool.totalSwapFee)
        .minus(pastPool.totalSwapFee)
        .times(365)
        .dividedBy(pool.totalLiquidity);
    }
  } catch (e) {
    // console.error('> getTradingFeeAprBalancer error', pairAddresses[0]);
  }

  return pairAddressesToAprMap;
};

export const getTradingFeeAprBalancerFTM = async (
  client: ApolloClient<NormalizedCacheObject>,
  pairAddresses: string[],
  liquidityProviderFee: number,
) => {
  const blockTime = await getBlockTime(250);
  const currentBlock = await getBlockNumber(250);
  const pastBlock = Math.floor(currentBlock - 86400 / blockTime);
  const pairAddressesToAprMap: Record<string, BigNumber> = {};

  try {
    const queryCurrent = await client.query<PoolsDataResult>({
      query: poolsDataQuery(addressesToLowercase(pairAddresses), currentBlock - 600),
    });

    const queryPast = await client.query<PoolsDataResult>({
      query: poolsDataQuery(addressesToLowercase(pairAddresses), pastBlock - 600),
    });

    const poolDayDatas0 = queryCurrent.data.pools;
    const poolDayDatas1 = queryPast.data.pools;

    for (const pool of poolDayDatas0) {
      const pair = pool.address.toLowerCase();
      const pastPool = poolDayDatas1.filter((p) => {
        return p.address === pool.address;
      })[0];
      if (!pastPool) {
        throw new Error(`${pool.address} not found`);
      }
      pairAddressesToAprMap[pair] = new BigNumber(pool.totalSwapFee)
        .minus(pastPool.totalSwapFee)
        .times(365)
        .dividedBy(pool.totalLiquidity);
    }
  } catch (e) {
    // console.error('> getTradingFeeAprBalancerFTM error', pairAddresses[0]);
  }

  return pairAddressesToAprMap;
};

export const getTradingFeeAprHop = async (
  client: ApolloClient<NormalizedCacheObject>,
  pairAddresses: string[],
  tokens: string[],
  tvl: number[],
  liquidityProviderFee: number,
) => {
  if (tokens.length !== tvl.length || tokens.length !== pairAddresses.length) {
    throw new Error(`tokens.length !== tvl.length !== pairAddresses.length`);
  }

  const [start, end] = getUtcSecondsFromDayRange(1, 2);
  const pairAddressToAprMap: Record<string, BigNumber> = {};

  try {
    // TODO: client requests could be done concurrently
    for (let i = 0; i < tokens.length; ++i) {
      const token = tokens[i]!;
      const tokenTvl = tvl[i]!;
      const pairAddress = pairAddresses[i]!;

      const {
        data: { tokenSwaps },
      } = await client.query<HopResult>({
        query: hopQuery(token, start, end),
      });
      const values = tokenSwaps.map(({ tokensSold }) => tokensSold);
      const sum = BigNumber.sum.apply(null, values);
      pairAddressToAprMap[pairAddress] = sum.times(liquidityProviderFee).times(365).dividedBy(tokenTvl);
    }
  } catch (e) {
    // console.error('> getTradingFeeAprHop error', pairAddresses[0]);
  }

  return pairAddressToAprMap;
};

const addressesToLowercase = (pairAddresses: string[]) =>
  pairAddresses.map((address) => address.toLowerCase());

export const getYearlyPlatformTradingFees = async (
  client: ApolloClient<NormalizedCacheObject>,
  liquidityProviderFee: number,
) => {
  let yearlyTradingFeesUsd = new BigNumber(0);
  const timestamp = Date.now();

  try {
    const data = await client.query({ query: dayDataQuery(timestamp) });

    const dailyVolumeUSD = new BigNumber(data.data.uniswapDayData.dailyVolumeUSD);

    yearlyTradingFeesUsd = dailyVolumeUSD.times(liquidityProviderFee).times(365);
  } catch (e) {
    // console.error('> getYearlyPlatformTradingFees error');
  }

  return yearlyTradingFeesUsd;
};

export const getYearlyJoePlatformTradingFees = async (
  client: ApolloClient<NormalizedCacheObject>,
  liquidityProviderFee: number,
) => {
  let yearlyTradingFeesUsd = new BigNumber(0);
  const timestamp = Date.now();

  try {
    const data = await client.query({ query: joeDayDataQuery(timestamp) });

    const dailyVolumeUSD = new BigNumber(data.data.dayData.volumeUSD);

    yearlyTradingFeesUsd = dailyVolumeUSD.times(liquidityProviderFee).times(365);
  } catch (e) {
    // console.error('> getYearlyJoePlatformTradingFees error');
  }

  return yearlyTradingFeesUsd;
};

export const getYearlyRemittedUsdForSJOE = async (
  client: ApolloClient<NormalizedCacheObject>,
  numDays = 7,
  startDaysAgo = 1,
) => {
  let yearlyRemittedUsd = new BigNumber(0);
  const [startTimestamp, endTimestamp] = getUtcSecondsFromDayRange(startDaysAgo, startDaysAgo + numDays);

  try {
    const result = await client.query<JoeDayDataRangeResult>({
      query: joeDayDataRangeQuery(startTimestamp, endTimestamp),
    });
    const dayData = result.data.dayDatas.map((day) => new BigNumber(day.usdRemitted));
    const totalVolume = BigNumber.sum(...dayData);
    yearlyRemittedUsd = totalVolume.dividedBy(numDays).times(365);
  } catch (e) {
    // console.error('> getYearlyRemittedUsdForSJOE error');
  }

  return yearlyRemittedUsd;
};

export const getYearlyTradingFeesForProtocols = async (
  client: ApolloClient<NormalizedCacheObject>,
  liquidityProviderFee: number,
) => {
  let yearlyTradingFeesUsd = new BigNumber(0);
  const [start0, end0] = getUtcSecondsFromDayRange(1, 8);

  try {
    const data = await client.query<ProtocolDayDataRangeResult>({
      query: protocolDayDataRangeQuery(start0, end0),
    });

    const dayData = data.data.uniswapDayDatas.map((data) => new BigNumber(data.dailyVolumeUSD));

    const totalVolume = BigNumber.sum.apply(null, dayData);
    const avgVolume = totalVolume.dividedBy(7);
    const dailyTradingApr = avgVolume.times(liquidityProviderFee);
    yearlyTradingFeesUsd = dailyTradingApr.times(365);
  } catch (e) {
    // console.error('> getYearlyTradingFeesForProtocols error');
  }

  return yearlyTradingFeesUsd;
};

export const getYearlyBalancerPlatformTradingFees = async (
  client: ApolloClient<NormalizedCacheObject>,
  liquidityProviderFeeShare: number,
) => {
  const blockTime = await getBlockTime(250);
  const currentBlock = await getBlockNumber(250);
  const pastBlock = Math.floor(currentBlock - 86400 / blockTime);

  let yearlyTradingFeesUsd = new BigNumber(0);

  try {
    const currentData = await client.query({
      query: balancerDataQuery(currentBlock),
    });
    const pastData = await client.query({
      query: balancerDataQuery(pastBlock),
    });
    const currentSwapFee = new BigNumber(currentData.data.balancers[0].totalSwapFee);
    const pastSwapFee = new BigNumber(pastData.data.balancers[0].totalSwapFee);

    const dailySwapFeeUsd = currentSwapFee.minus(pastSwapFee);

    yearlyTradingFeesUsd = dailySwapFeeUsd.times(365).times(liquidityProviderFeeShare);
  } catch (e) {
    console.error('> getYearlyBalancerPlatformTradingFees error');
  }

  return yearlyTradingFeesUsd;
};

export const getGmxTradingFeeApr = async (
  client: ApolloClient<NormalizedCacheObject>,
  marketAddresses: string[],
) => {
  const [start, end] = getUtcSecondsFromDayRange(0, 1);
  const marketAddressToAprMap: Record<string, BigNumber> = {};

  try {
    const currentData = await client.query<GmxResult>({
      query: gmxQuery(addressesToLowercase(marketAddresses), end),
    });
    const pastData = await client.query<GmxResult>({
      query: gmxQuery(addressesToLowercase(marketAddresses), start),
    });
    const currentFees = currentData.data.collectedMarketFeesInfos;
    const pastFees = pastData.data.collectedMarketFeesInfos;

    for (let market of marketAddresses) {
      market = market.toLowerCase();
      const currentMarket = currentFees.find((m) => m.marketAddress === market);
      const pastMarket = pastFees.find((m) => m.marketAddress === market);

      if (!currentMarket || !pastMarket) {
        continue;
      }

      const elapsed = new BigNumber(currentMarket.timestampGroup).minus(pastMarket.timestampGroup);
      marketAddressToAprMap[market] = new BigNumber(currentMarket.cumulativeFeeUsdPerPoolValue)
        .minus(pastMarket.cumulativeFeeUsdPerPoolValue)
        .dividedBy(elapsed)
        .times(31536000)
        .dividedBy('1e30');
    }
  } catch (e) {
    //console.error('> getGmxTradingFeeApr error', marketAddresses[0]);
  }

  return marketAddressToAprMap;
};

export const getBaseSwapTradingFeeApr = async (
  client: ApolloClient<NormalizedCacheObject>,
  pairAddresses: string[],
  liquidityProviderFee: number,
) => {
  const [start, end] = getUtcSecondsFromDayRange(1, 2);
  const pairAddressToAprMap: Record<string, BigNumber> = {};

  try {
    const {
      data: { liquidityPoolDailySnapshots },
    } = await client.query<BaseSwapResult>({
      query: baseSwapQuery(addressesToLowercase(pairAddresses), start, end),
    });

    for (const baseSwapData of liquidityPoolDailySnapshots) {
      const pairAddress = baseSwapData.id.split('-')[0]!.toLowerCase();
      pairAddressToAprMap[pairAddress] = new BigNumber(baseSwapData.dailyVolumeUSD)
        .times(liquidityProviderFee)
        .times(365)
        .dividedBy(baseSwapData.totalValueLockedUSD);
    }
  } catch (e) {
    //console.error('> getBaseSwapTradingFeeApr error', pairAddresses[0]);
  }

  return pairAddressToAprMap;
};
