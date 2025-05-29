import { BASE_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/base/tokemakPools.json';
import getTokemakPrices from '../common/getTokemakPrices.js';

const getTokemakBasePrices = async (tokenPrices: Record<string, number>) => {
  return await getTokemakPrices(chainId, pools, tokenPrices);
};

export default getTokemakBasePrices;
