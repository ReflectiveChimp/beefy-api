import BigNumber from 'bignumber.js';
import ERC20Abi from '../../../../abis/ERC20Abi.js';
import Reader from '../../../../abis/arbitrum/Reader.js';
import { fetchContract } from '../../../rpc/client.js';
import { ChainId } from 'blockchain-addressbook';
import type { Address } from 'viem';
import type { LpBreakdown } from '../../getAmmPrices.js';

type Pool = {
  name: string;
  address: string;
  index: {
    symbol: string;
    address: string;
  };
  long: {
    symbol: string;
    address: string;
    decimals: string;
  }
  short: {
    symbol: string;
    address: string;
    decimals: string;
  }
}

type OutputPrices = Record<string, number | LpBreakdown>;

export const getGmxV2Prices = async (chainId: ChainId, reader: Address, dataStore: Address, url: string, pools: Pool[]): Promise<OutputPrices> => {
  const prices: OutputPrices = {};
  const tokenPrices = await getTokenPrices(url);
  if (!tokenPrices) {
    return prices;
  }

  const values = await Promise.all(pools.map(pool => getPrice(chainId, reader, dataStore, pool, tokenPrices)));
  values.forEach(value => Object.assign(prices, value));
  return prices;
};

type GmxTokenPrice = {
  tokenSymbol: string;
  minPrice: number;
  maxPrice: number;
}

const getTokenPrices = async (url: string) => {
  try {
    return (await fetch(url).then((res) => res.json())) as GmxTokenPrice[];
  } catch (err) {
    console.error('GMX price error ', url);
  }
};

const getPrice = async (chainId: number, reader: Address, dataStore: Address, pool: Pool, tokenPrices: GmxTokenPrice[]): Promise<OutputPrices> => {
  const indexPrice = pool.index.address != '0x0000000000000000000000000000000000000000' ? { tokenSymbol: "0x0", minPrice: 0, maxPrice: 0 } : tokenPrices.find((v) => v.tokenSymbol == pool.index.symbol);
  const longPrice = tokenPrices.find((v) => v.tokenSymbol == pool.long.symbol);
  const shortPrice = tokenPrices.find((v) => v.tokenSymbol == pool.short.symbol);
  if (!indexPrice || !longPrice || !shortPrice) {
    console.warn(`Missing one of index/long/short price for ${pool.name}`);
    return {};
  }

  const [{ price, tokens, shiftedBalances, totalSupply }] = await Promise.all([
    getLpPrice(chainId, reader, dataStore, pool, indexPrice, longPrice, shortPrice),
  ]);
  return {
    [pool.name]: {
      price: price,
      tokens: tokens,
      balances: shiftedBalances,
      totalSupply: totalSupply,
    },
  };
};

const getLpPrice = async (chainId: ChainId, reader: Address, dataStore: Address, pool: Pool, indexPrice: GmxTokenPrice, longPrice: GmxTokenPrice, shortPrice: GmxTokenPrice) => {
  const readerContract = fetchContract(reader, Reader, chainId);
  const marketContract = fetchContract(pool.address, ERC20Abi, chainId);

  const result = await Promise.all([
    readerContract.read.getMarketTokenPrice([
      dataStore,
      {
        marketToken: pool.address as `0x${string}`,
        indexToken: pool.index.address as `0x${string}`,
        longToken: pool.long.address as `0x${string}`,
        shortToken: pool.short.address as `0x${string}`,
      },
      { min: BigInt(indexPrice.minPrice), max: BigInt(indexPrice.maxPrice) },
      { min: BigInt(longPrice.minPrice), max: BigInt(longPrice.maxPrice) },
      { min: BigInt(shortPrice.minPrice), max: BigInt(shortPrice.maxPrice) },
      '0xdd8747ceca84c84319e46661e0ee4095cc511df8c2208b6ff4e9d2b2e6930bb6', // withdrawal type
      true,
    ]),
    marketContract.read.totalSupply(),
  ]);
  const marketPrice = new BigNumber((result[0][0] as bigint).toString());
  const price = marketPrice.dividedBy('1e30').toNumber();
  const longAmount = new BigNumber((result[0][1].longTokenAmount as bigint).toString());
  const shortAmount = new BigNumber((result[0][1].shortTokenAmount as bigint).toString());
  const totalSupply = new BigNumber(result[1].toString()).dividedBy('1e18').toString();
  const tokens = [pool.long.address, pool.short.address];
  const shiftedBalances = [
    longAmount.dividedBy(pool.long.decimals).toString(),
    shortAmount.dividedBy(pool.short.decimals).toString(),
  ];
  return { price, tokens, shiftedBalances, totalSupply };
};
