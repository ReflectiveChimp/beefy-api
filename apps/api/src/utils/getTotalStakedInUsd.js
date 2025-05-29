import BigNumber from 'bignumber.js';
import { default as ERC20Abi } from '../abis/ERC20Abi.jsx';
import { fetchContract } from '../api/rpc/client.js';
import { fetchPrice } from './fetchPrice.js';

const getTotalStakedInUsd = async (
  targetAddr,
  tokenAddr,
  oracle,
  oracleId,
  decimals = '1e18',
  chainId = 56,
) => {
  const tokenContract = fetchContract(tokenAddr, ERC20Abi, chainId);
  const totalStaked = new BigNumber((await tokenContract.read.balanceOf([targetAddr])).toString());
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  return totalStaked.times(tokenPrice).dividedBy(decimals);
};

const getTotalLpStakedInUsd = async (targetAddr, pool, chainId = 56) => {
  return await getTotalStakedInUsd(targetAddr, pool.address, 'lps', pool.name, '1e18', chainId);
};

export { getTotalStakedInUsd, getTotalLpStakedInUsd };
