import gql from 'graphql-tag';

export type PairDayDataVariables = {
  pairs: string[];
  start: number;
  end: number;
};

export type PairDayDataResult = {
  pairDayDatas: Array<{
    id: string;
    pairAddress: string;
    date: Date;
    dailyVolumeToken0: string;
    dailyVolumeToken1: string;
    dailyVolumeUSD: string;
    totalSupply: string;
    reserveUSD: string;
  }>;
};

export const pairDayDataQuery = gql`
  query days($pairs: String[]!, start: Int!, $end: Int!) {
    pairDayDatas(first: 1000, orderBy: date, orderDirection: asc, where: { pairAddress_in: $pairs, date_gt: $start, date_lt: $end }) {
      id
      pairAddress
      date
      dailyVolumeToken0
      dailyVolumeToken1
      dailyVolumeUSD
      totalSupply
      reserveUSD
    }
  }
`;

// const pairDayDataQuery = (pairs, startTimestamp, endTimestamp) => {
//   let pairsString = `[`;
//   pairs.map((pair) => {
//     return (pairsString += `"${pair}"`);
//   });
//   pairsString += ']';
//   const queryString = `
//     query days {
//       pairDayDatas(first: 1000, orderBy: date, orderDirection: asc, where: { pairAddress_in: ${pairsString}, date_gt: ${startTimestamp}, date_lt: ${endTimestamp} }) {
//         id
//         pairAddress
//         date
//         dailyVolumeToken0
//         dailyVolumeToken1
//         dailyVolumeUSD
//         totalSupply
//         reserveUSD
//       }
//     }
// `;
//   return gql(queryString);
// };

export type PairDayDataSushiResult = {
  pairs: Array<{
    dayData: Array<{
      id: string;
      date: Date;
      volumeToken0: string;
      volumeToken1: string;
      volumeUSD: string;
      totalSupply: string;
      reserveUSD: string;
    }>;
  }>;
};

export const pairDayDataSushiQuery = (pairs: string[], startTimestamp: number, endTimestamp: number) => {
  let pairsString = `[`;
  pairs.map((pair) => {
    return (pairsString += `"${pair}"`);
  });
  pairsString += ']';
  const queryString = `
    query days {
      pairs(where: { id_in: ${pairsString}}) {
        dayData(first: 1000, orderBy: date, orderDirection: asc, where: { date_gt: ${startTimestamp}, date_lt: ${endTimestamp} }) {
          id
          date
          volumeToken0
          volumeToken1
          volumeUSD
          totalSupply
          reserveUSD
        }
      }
    } 
`;
  return gql(queryString);
};

export type PairDayDataSushiTridentResult = {
  pairDaySnapshots: Array<{
    id: string;
    volumeToken0: string;
    volumeToken1: string;
    volumeUSD: string;
    liquidityUSD: string;
  }>;
};

export const pairDayDataSushiTridentQuery = (
  pairs: string[],
  startTimestamp: number,
  endTimestamp: number,
) => {
  let pairsString = `[`;
  pairs.map((pair) => {
    return (pairsString += `"${pair}"`);
  });
  pairsString += ']';
  const queryString = `
    query days {
      pairDaySnapshots( first: 1000, orderBy: date, orderDirection: asc, where: { pair_in: ${pairsString} date_gt: ${startTimestamp}, date_lt: ${endTimestamp}}) {
          id
          volumeToken0
          volumeToken1
          volumeUSD
          liquidityUSD
        }
      }
`;
  return gql(queryString);
};

export type PoolsDataResult = {
  pools: Array<{
    address: string;
    totalSwapFee: string;
    totalLiquidity: string;
  }>;
};

export const poolsDataQuery = (pairs: string[], block: number) => {
  let pairsString = `[`;
  pairs.map((pair) => {
    return (pairsString += `"${pair}"`);
  });
  pairsString += ']';
  const queryString = `
    query days {
      pools(first: 1000, block: { number: ${block} }, where: { address_in: ${pairsString} }) {
        address
        totalSwapFee
        totalLiquidity
      }
    }
`;
  return gql(queryString);
};

export const dayDataQuery = (timestamp: number) => {
  const dayId = Math.floor(timestamp / 86400000) - 1;
  const queryString = `
    query days {
      uniswapDayData(id: "${dayId}") {
        dailyVolumeUSD
      }
    }
`;
  return gql(queryString);
};

export const joeDayDataQuery = (timestamp: number) => {
  const dayId = Math.floor(timestamp / 86400000) - 1;
  const queryString = `
    query days {
      dayData(id: "${dayId}") {
        volumeUSD
      }
    }
`;
  return gql(queryString);
};

export type JoeDayDataRangeResult = {
  dayDatas: Array<{
    usdRemitted: string;
  }>;
};

export const joeDayDataRangeQuery = (startTimestamp: number, endTimestamp: number) => {
  const queryString = `
  query volumeUSD {
    dayDatas(where: { date_gt: ${startTimestamp}, date_lt: ${endTimestamp} }) {
      usdRemitted
    }
  }
`;
  return gql(queryString);
};

export type ProtocolDayDataRangeResult = {
  uniswapDayDatas: Array<{
    dailyVolumeUSD: string;
  }>;
};

export const protocolDayDataRangeQuery = (startTimestamp: number, endTimestamp: number) => {
  const queryString = `
  query volume {
    uniswapDayDatas(where: { date_gt: ${startTimestamp}, date_lt: ${endTimestamp} }) {
      dailyVolumeUSD
    }
  }
`;
  return gql(queryString);
};

export const balancerDataQuery = (block: number) => {
  const queryString = `
    query balancer {
      balancers(block: { number: ${block} }) {
        totalSwapFee
      }
    }
`;
  return gql(queryString);
};

export const uniswapPositionQuery = (strategy: string, block: number) => {
  const queryString = `
    query positionData {
      positions(where: {owner: "${strategy}", _change_block: {number_gte: ${block}}}) {
        id
        collectedFeesToken0
        collectedFeesToken1
      }
    }
`;
  return gql(queryString);
};

export type HopResult = {
  tokenSwaps: Array<{
    tokensSold: string;
  }>;
};

export const hopQuery = (address: string, startTimestamp: number, endTimestamp: number) => {
  const queryString = `
  query hop {
    tokenSwaps(first: 1000, orderBy: tokensSold, orderDirection: desc, where: { tokenEntity_: { address:"${address}" } , timestamp_gt: ${startTimestamp}, timestamp_lt: ${endTimestamp} }) {
      tokensSold
    }
  }
`;
  return gql(queryString);
};

export type GmxResult = {
  collectedMarketFeesInfos: Array<{
    marketAddress: string;
    cumulativeFeeUsdPerPoolValue: string;
    timestampGroup: string;
  }>;
};

export const gmxQuery = (markets: string[], timestamp: number) => {
  let marketsString = `[`;
  markets.map((market) => {
    return (marketsString += `"${market}"`);
  });
  marketsString += ']';
  const queryString = `
    query gmx {
      collectedMarketFeesInfos(first: 1000, orderBy: timestampGroup, orderDirection: desc, where: { marketAddress_in: ${marketsString}, timestampGroup_lte: ${timestamp}}) {
        marketAddress
        cumulativeFeeUsdPerPoolValue
        timestampGroup
      }
    }
  `;
  return gql(queryString);
};

export type BaseSwapResult = {
  liquidityPoolDailySnapshots: Array<{
    id: string;
    dailyVolumeUSD: string;
    totalValueLockedUSD: string;
  }>;
};

export const baseSwapQuery = (pairs: string[], startTimestamp: number, endTimestamp: number) => {
  let pairsString = `[`;
  pairs.map((pair) => {
    return (pairsString += `"${pair}"`);
  });
  pairsString += ']';
  const queryString = `
    query baseSwapDatas {
      liquidityPoolDailySnapshots(orderBy: timestamp, orderDirection: desc, where: { pool_in: ${pairsString}, timestamp_gt: ${startTimestamp}, timestamp_lt: ${endTimestamp} }) {
        id
    		dailyVolumeUSD
        totalValueLockedUSD
      }
    }
  `;
  return gql(queryString);
};
