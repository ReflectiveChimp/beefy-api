import { LINEA_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/linea/nileStablePools.json';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.js';

const getNileStablePrices = async (tokenPrices) => {
  return await getSolidlyStablePrices(chainId, pools, tokenPrices);
};

export default getNileStablePrices;
