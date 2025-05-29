import BigNumber from 'bignumber.js';

import type { ChainId } from 'blockchain-addressbook';
import SwapAbi from '../../../../abis/common/Swap/Swap.js';
import type { SingleAssetPool } from '../../../../types/LpPool.js';
import { fetchContract } from '../../../rpc/client.js';

// gets the prices of LPToken contracts deployed from Swap contracts.
// Example is IronSwap (0x837503e8A8753ae17fB8C8151B8e6f586defCb57) on polygon

interface SwapPricesParams {
  chainId: ChainId;
  pools: SingleAssetPool[];
}

export const getSwapPrices = async ({ chainId, pools }: SwapPricesParams): Promise<Record<string, number>> => {
  // create closure of _getPrice with web3 to avoid passing in web3 every time
  const getPrice = (pool: SwapPool) => {
    return _getPrice(chainId, pool);
  };

  const swapPools = pools.filter((pool): pool is SwapPool => pool.swap !== undefined);

  const promises: Promise<[string, number]>[] = [];
  swapPools.forEach((pool) => promises.push(getPrice(pool)));
  const values = await Promise.all(promises);

  const prices: Record<string, number> = {};

  values.forEach((poolTokenPrice) => {
    const [name, price] = poolTokenPrice;
    prices[name] = price;
  });

  return prices;
};

const _getPrice = async (chainId: ChainId, pool: SwapPool): Promise<[string, number]> => {
  const swapContract = fetchContract(pool.swap, SwapAbi, chainId);
  const virtualPrice = await swapContract.read.getVirtualPrice();
  const tokenPrice = new BigNumber(virtualPrice.toString()).dividedBy(pool.decimals).toNumber();

  return [pool.name, tokenPrice];
};

type SwapPool = Omit<SingleAssetPool, 'swap'> & { swap: string };