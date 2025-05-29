import { BSC_CHAIN_ID } from '../../../constants.js';
import thenaPools from '../../../data/bsc/thenaGammaPools.json';
import getGammaPrices from '../common/getGammaPrices.js';

const pools = [...thenaPools];
const getBscGammaPrices = async (tokenPrices) => {
  return await getGammaPrices(BSC_CHAIN_ID, pools, tokenPrices);
};

export default getBscGammaPrices;
