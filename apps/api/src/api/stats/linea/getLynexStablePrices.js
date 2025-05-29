import { LINEA_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/linea/lynexStablePools.json';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.js';

const getLynexStablePrices = async (tokenPrices) => {
  return await getSolidlyStablePrices(chainId, pools, tokenPrices);
};

export default getLynexStablePrices;
