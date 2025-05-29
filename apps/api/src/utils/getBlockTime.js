import { default as BigNumber } from 'bignumber.js';
import { getRPCClient } from '../api/rpc/client.js';

const updateDelay = 3000000;
const blockPeriod = 1000n;

const cache = {};
const getBlockTime = async (chainId) => {
  try {
    const cacheKey = Math.floor(Date.now() / updateDelay);

    if (cache[chainId]?.hasOwnProperty(cacheKey)) {
      return cache[chainId][cacheKey];
    }

    const client = getRPCClient(chainId);

    const latestBlock = await client.getBlock({ blockTag: 'latest' });
    const fromBlock = await client.getBlock({
      blockNumber: latestBlock.number - blockPeriod,
    });

    const blockTimePromise = new BigNumber(
      Number(latestBlock.timestamp - fromBlock.timestamp) / Number(blockPeriod),
    );

    cache[chainId] = {
      [cacheKey]: blockTimePromise,
    };
    return blockTimePromise;
  } catch (err) {
    console.error(`getBlockTime error on ${chainId}:`);
    // console.error(err);
    return new BigNumber(0);
  }
};

export default getBlockTime;
