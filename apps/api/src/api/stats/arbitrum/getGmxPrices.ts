import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/arbitrum/gmxPools.json';
import { getGmxPrices } from '../common/gmx/getGmxPrices.js';

export const getGmxArbitrumPrices = async (tokenPrices: Record<string, number>) => {
  return await getGmxPrices(chainId, pools, tokenPrices);
};
