import { KAVA_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/kava/kinetixPools.json';
import { getGmxPrices } from '../common/gmx/getGmxPrices.js';

export const getKinetixPrices = async (tokenPrices: Record<string, number>) => {
  return await getGmxPrices(chainId, pools, tokenPrices);
};
