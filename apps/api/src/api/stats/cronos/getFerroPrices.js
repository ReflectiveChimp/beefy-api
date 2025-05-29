import { CRONOS_CHAIN_ID } from '../../../constants.js';
import pools from '../../../data/cronos/ferroPools.json';
import getStableSwapPrices from '../common/getStableSwapPrices.js';

const getFerroPrices = async (tokenPrices) => {
  return await getStableSwapPrices(CRONOS_CHAIN_ID, pools, tokenPrices);
};

export default getFerroPrices;
