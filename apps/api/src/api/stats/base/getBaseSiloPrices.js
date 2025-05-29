import { BASE_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/base/siloPools.json';
import getSiloPrices from '../common/getSiloPrices.js';

const getBaseSiloPrices = async (tokenPrices) => {
  return await getSiloPrices(chainId, pools, tokenPrices);
};

export default getBaseSiloPrices;
