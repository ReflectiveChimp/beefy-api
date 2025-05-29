import { LINEA_CHAIN_ID as chainId } from '../../../constants.js';
import gammaPools from '../../../data/linea/lynexGammaPools.json';
import ichiPools from '../../../data/linea/lynexIchiPools.json';
import getGammaPrices from '../common/getGammaPrices.js';

const pools = [...gammaPools, ...ichiPools];
const getGammaLineaPrices = async (tokenPrices) => {
  return await getGammaPrices(chainId, pools, tokenPrices);
};

export default getGammaLineaPrices;
