import { FANTOM_CHAIN_ID } from '../../../constants.js';
import equalizerPools from '../../../data/fantom/equalizerIchiPools.json';
import getGammaPrices from '../common/getGammaPrices.js';

const pools = [...equalizerPools];
const getFtmIchiPrices = async (tokenPrices) => {
  return await getGammaPrices(FANTOM_CHAIN_ID, pools, tokenPrices);
};

export default getFtmIchiPrices;
