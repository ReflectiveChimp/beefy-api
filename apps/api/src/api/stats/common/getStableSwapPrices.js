import BigNumber from 'bignumber.js';
import { default as ERC20Abi } from '../../../abis/ERC20Abi.jsx';
import { default as IStableSwapAbi } from '../../../abis/IStableSwap.jsx';
import { fetchContract } from '../../rpc/client.js';

const DECIMALS = '1e18';

const getStableSwapPrices = async (chainId, pools, tokenPrices) => {
  let prices = {};
  const promises = [];
  pools.forEach((pool) => promises.push(getPrice(chainId, pool, tokenPrices)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getPrice = async (chainId, pool, tokenPrices) => {
  const lpContract = fetchContract(pool.pool, IStableSwapAbi, chainId);

  const virtualPrice = new BigNumber((await lpContract.read.getVirtualPrice()).toString());
  const tokenPrice = getTokenPrice(tokenPrices, pool.virtualOracleId);
  const price = virtualPrice.multipliedBy(tokenPrice).dividedBy(pool.decimals).toNumber();

  const { tokens, balances, totalSupply } = await getLpBreakdownData(chainId, pool);
  return { [pool.name]: { price, tokens, balances, totalSupply } };
};

const getLpBreakdownData = async (chainId, pool) => {
  const supplyContract = fetchContract(pool.address, ERC20Abi, chainId);

  const promises = [];
  pool.tokens.forEach((_, index) => promises.push(getTokenBalanceAndAddress(chainId, pool.pool, index)));
  promises.push(supplyContract.read.totalSupply());

  const results = await Promise.all(promises);

  const tokens = [];
  const balances = [];

  for (let i = 0; i < pool.tokens.length; i++) {
    tokens.push(results[i].tokenAddress);
    balances.push(new BigNumber(results[i].balance).dividedBy(pool.tokens[i].decimals).toString(10));
  }

  const totalSupply = new BigNumber(results[pool.tokens.length]).dividedBy(DECIMALS).toString(10);

  return { tokens, balances, totalSupply };
};

const getTokenBalanceAndAddress = async (chainId, stablePool, index) => {
  const pool = fetchContract(stablePool, IStableSwapAbi, chainId);

  const promises = [pool.read.getTokenBalance([index]), pool.read.getToken([index])];
  const [balance, tokenAddress] = await Promise.all(promises);

  return { balance, tokenAddress };
};

const getTokenPrice = (tokenPrices, oracleId) => {
  if (!oracleId) return 1;
  let tokenPrice = 1;
  const tokenSymbol = oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    console.error(`Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }
  return tokenPrice;
};

export default getStableSwapPrices;
