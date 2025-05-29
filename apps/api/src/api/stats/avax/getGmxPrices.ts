import { AVAX_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/avax/gmxPools.json';
import { getGmxPrices } from '../common/gmx/getGmxPrices.js';

export const getGmxAvalanchePrices = async (tokenPrices: Record<string, number>) => {
  return await getGmxPrices(chainId, pools, tokenPrices);
};
