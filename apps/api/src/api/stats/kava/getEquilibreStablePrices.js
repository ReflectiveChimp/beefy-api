import { KAVA_CHAIN_ID } from '../../../constants.js';
import pools from '../../../data/kava/equilibreStableLpPools.json';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.js';

const getEquilibreStablePrices = async (tokenPrices) => {
  return await getSolidlyStablePrices(KAVA_CHAIN_ID, pools, tokenPrices);
};

export default getEquilibreStablePrices;
