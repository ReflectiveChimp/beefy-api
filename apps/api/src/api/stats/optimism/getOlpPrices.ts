import BigNumber from 'bignumber.js';
import { getAddress } from 'viem';
import ERC20Abi from '../../../abis/ERC20Abi.js';
import GlpManagerAbi from '../../../abis/arbitrum/GlpManager.js';
import { OPTIMISM_CHAIN_ID } from '../../../constants.js';
import pools from '../../../data/optimism/olpPools.json';
import { fetchContract } from '../../rpc/client.js';
import type { BaseLpBreakdown } from '../getAmmPrices.js';

type Pool = (typeof pools)[number];

const getOlpPrices = async () => {
  let prices = {};
  const promises: Array<Promise<Record<string, BaseLpBreakdown>>> = [];
  pools.forEach((pool) => promises.push(getPrice(pool)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getPrice = async (pool: Pool): Promise<Record<string, BaseLpBreakdown>> => {
  const [price, results] = await Promise.all([getLpPrice(pool), getLpTokenBalances(pool)]);
  return {
    [pool.name]: {
      price: price[0],
      tokens: results[0],
      balances: results[1],
      totalSupply: price[1].dividedBy(pool.decimals).toString(10),
    },
  };
};

const getLpTokenBalances = async (pool: Pool) => {
  const balanceCalls = pool.tokens.map((token) => {
    const contract = fetchContract(token.address, ERC20Abi, OPTIMISM_CHAIN_ID);
    return contract.read.balanceOf([getAddress(pool.vault)]);
  });
  const balanceResults = await Promise.all(balanceCalls);
  const bal = balanceResults.map((v) => new BigNumber(v.toString()));

  const tokens = [];
  const shiftedBalances = [];
  for (let i = 0; i < pool.tokens.length; i++) {
    shiftedBalances.push(new BigNumber(bal[i]!).dividedBy(pool.tokens[i]!.decimals).toString(10));
    tokens.push(pool.tokens[i]!.address);
  }

  return [tokens, shiftedBalances] as const;
};

const getLpPrice = async (pool: Pool) => {
  const glpManagerContract = fetchContract(pool.glpManager, GlpManagerAbi, OPTIMISM_CHAIN_ID);
  const glpContract = fetchContract(pool.address, ERC20Abi, OPTIMISM_CHAIN_ID);

  const results = await Promise.all([
    glpManagerContract.read.getAumInUsdg([true]),
    glpContract.read.totalSupply(),
  ]);
  const aum = new BigNumber(results[0].toString());
  const totalSupply = new BigNumber(results[1].toString());
  const price = aum.dividedBy(totalSupply).toNumber();

  return [price, totalSupply] as const;
};

export default getOlpPrices;
