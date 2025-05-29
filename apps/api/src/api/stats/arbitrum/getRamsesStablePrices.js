import { ARBITRUM_CHAIN_ID } from '../../../constants.js';
import pools from '../../../data/arbitrum/ramsesStableLpPools.json';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.js';

const getRamsesStablePrices = async (tokenPrices) => {
  return await getSolidlyStablePrices(ARBITRUM_CHAIN_ID, pools, tokenPrices);
};

export default getRamsesStablePrices;
