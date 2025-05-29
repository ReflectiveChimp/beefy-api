import { BSC_CHAIN_ID } from '../../../constants.js';
import pools from '../../../data/bsc/thenaStableLpPools.json';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.js';

const getThenaStablePrices = async (tokenPrices) => {
  return await getSolidlyStablePrices(BSC_CHAIN_ID, pools, tokenPrices);
};

export default getThenaStablePrices;
