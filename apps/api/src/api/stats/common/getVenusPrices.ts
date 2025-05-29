import BigNumber from 'bignumber.js';
import VenusToken from '../../../abis/VenusToken.js';
import { fetchContract } from '../../rpc/client.js';
import { ChainId } from 'blockchain-addressbook';
import type { LpBreakdown } from '../getAmmPrices.js';
import type { LpPool } from '../../../types/LpPool.js';
import type { Address } from 'viem';

type OutputPrices = Record<string, number | LpBreakdown>;

type Pool = LpPool & {
  cToken: string;
}

export const getVenusPrices = async (chainId: ChainId, pools: Pool[], tokenPrices: Record<string, number>) => {
  const [totalSupplyCalls, exchangeRateCalls, underlyingCalls] = pools.reduce(
    (acc, pool) => {
      const vTokenContract = fetchContract(pool.cToken, VenusToken, chainId);
      acc[0].push(vTokenContract.read.totalSupply());
      acc[1].push(vTokenContract.read.exchangeRateStored());
      acc[2].push(vTokenContract.read.underlying());
      return acc;
    },
    [[], [], []] as [Promise<bigint>[], Promise<bigint>[], Promise<Address>[]],
  );

  const [totalSupplyResults, exchangeRateResults, underlyingResults] = await Promise.all([
    Promise.all(totalSupplyCalls),
    Promise.all(exchangeRateCalls),
    Promise.all(underlyingCalls),
  ]);

  const prices: OutputPrices = {};
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i]!;
    // TODO check index exists
    const totalSupply = new BigNumber(totalSupplyResults[i]!).div('1e8');
    // TODO check index exists
    const exchangeRate = new BigNumber(exchangeRateResults[i]!).div('1e10').div(pool.decimals);

    const priceUnderlying = getTokenPrice(tokenPrices, pool.oracleId);
    const price = exchangeRate.times(priceUnderlying).toNumber();
    const balance = totalSupply.times(exchangeRate);

    prices[pool.name] = {
      price,
      // TODO check index exists
      tokens: [underlyingResults[i]!.toString()],
      balances: [balance.toString(10)],
      totalSupply: totalSupply.toString(10),
    };
  }
  return prices;
};

const getTokenPrice = (tokenPrices: Record<string, number>, oracleId?: string) => {
  if (!oracleId) {
    return 1;
  }

  const tokenPrice = tokenPrices[oracleId];
  if (tokenPrice === undefined) {
    console.error(`Unknown token '${oracleId}'. Consider adding it to .json file`);
  }
  return tokenPrice ?? 1;
};

export default getVenusPrices;
