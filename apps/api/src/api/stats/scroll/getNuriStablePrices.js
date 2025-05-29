import { SCROLL_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/scroll/nuriStablePools.json';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.js';

const getNuriStablePrices = async (tokenPrices) => {
  return await getSolidlyStablePrices(chainId, pools, tokenPrices);
};

export default getNuriStablePrices;
