import { SONIC_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/sonic/siloPools.json';
import getSiloPrices from '../common/getSiloPrices.js';

const getSonicSiloPrices = async (tokenPrices) => {
  return await getSiloPrices(chainId, pools, tokenPrices);
};

export default getSonicSiloPrices;
