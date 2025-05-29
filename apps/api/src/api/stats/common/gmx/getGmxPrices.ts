import BigNumber from 'bignumber.js';
import ERC20Abi from '../../../../abis/ERC20Abi.js';
import GlpManagerAbi from '../../../../abis/arbitrum/GlpManager.js';
import { fetchContract } from '../../../rpc/client.js';
import { ChainId } from 'blockchain-addressbook';
import { getAddress } from 'viem';
import type { LpBreakdown } from '../../getAmmPrices.js';

type Pool = {
  oracle: string;
  name: string;
  decimals: string;
  oracleId?: string;
  vault: string;
  address: string;
  glpManager: string;
  tokens: Array<{
    address: string;
    decimals: string;
  }>
}

type OutputPrices = Record<string, number | LpBreakdown>;

export const getGmxPrices = async (chainId: ChainId, pools: Pool[], tokenPrices: Record<string, number>): Promise<OutputPrices> => {
  let prices: OutputPrices = {};
  const values = await Promise.all(pools.map(pool => getPrice(chainId, pool, tokenPrices)));
  values.forEach(value => Object.assign(prices, value));
  return prices;
};

const getPrice = async (chainId: ChainId, pool: Pool, tokenPrices: Record<string,number>): Promise<OutputPrices> => {
  if (pool.oracle == 'lps') {
    const [{ price, totalSupply }, { tokens, shiftedBalances }] = await Promise.all([
      getLpPrice(chainId, pool),
      getLpTokenBalances(chainId, pool),
    ]);
    return {
      [pool.name]: {
        price: price,
        tokens: tokens,
        balances: shiftedBalances,
        totalSupply: totalSupply.dividedBy(pool.decimals).toString(10),
      },
    };
  } else {
    const price = getTokenPrice(tokenPrices, pool.oracleId);
    return { [pool.name]: price };
  }
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

const getLpTokenBalances = async (chainId: ChainId, pool: Pool) => {
  const balanceCalls = pool.tokens.map((token) => {
    const contract = fetchContract(token.address, ERC20Abi, chainId);
    return contract.read.balanceOf([getAddress(pool.vault)]);
  });
  const balanceResults = await Promise.all(balanceCalls);
  const bal = balanceResults.map((v) => new BigNumber(v.toString()));

  const tokens = [];
  const shiftedBalances = [];
  for (let i = 0; i < pool.tokens.length; i++) {
    // TODO check index exists
    shiftedBalances.push(new BigNumber(bal[i]!).dividedBy(pool.tokens[i]!.decimals).toString(10));
    tokens.push(pool.tokens[i]!.address);
  }

  return { tokens, shiftedBalances };
};

const getLpPrice = async (chainId: ChainId, pool: Pool) => {
  const glpManagerContract = fetchContract(pool.glpManager, GlpManagerAbi, chainId);
  const glpContract = fetchContract(pool.address, ERC20Abi, chainId);

  const result = await Promise.all([glpManagerContract.read.getAum([false]), glpContract.read.totalSupply()]);
  const aum = new BigNumber((result[0] as bigint).toString());
  const totalSupply = new BigNumber(result[1].toString());
  const price = aum.dividedBy(totalSupply).dividedBy('1e12').toNumber();

  return { price, totalSupply };
};
