import { CANTO_CHAIN_ID } from '../../../constants.js';
import pools from '../../../data/canto/cantoStableLpPools.json';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.js';

const getCantoStablePrices = async (tokenPrices) => {
  return await getSolidlyStablePrices(CANTO_CHAIN_ID, pools, tokenPrices);
};

export default getCantoStablePrices;
