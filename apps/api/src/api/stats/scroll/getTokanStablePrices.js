import { SCROLL_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/scroll/tokanStablePools.json';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.js';

const getTokanStablePrices = async (tokenPrices) => {
  return await getSolidlyStablePrices(chainId, pools, tokenPrices);
};

export default getTokanStablePrices;
