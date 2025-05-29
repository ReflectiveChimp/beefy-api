import { BASE_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/base/aerodromeStableLpPools.json';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.js';

export const getAerodromeStablePrices = async (tokenPrices) => {
  return await getSolidlyStablePrices(chainId, pools, tokenPrices);
};
