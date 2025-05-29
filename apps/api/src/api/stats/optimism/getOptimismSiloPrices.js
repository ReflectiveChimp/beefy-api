import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/optimism/siloPools.json';
import getSiloPrices from '../common/getSiloPrices.js';

const getOptimismSiloPrices = async (tokenPrices) => {
  return await getSiloPrices(chainId, pools, tokenPrices);
};

export default getOptimismSiloPrices;
