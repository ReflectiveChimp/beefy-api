import { POLYGON_CHAIN_ID } from '../../../constants.js';
import quickPools from '../../../data/matic/quickGammaLpPools.json';
import retroPools from '../../../data/matic/retroGammaPools.json';
import uniswapPools from '../../../data/matic/uniswapGammaPools.json';
import getGammaPrices from '../common/getGammaPrices.js';

const pools = [...quickPools, ...uniswapPools, ...retroPools];

const getGammaPolygonPrices = async (tokenPrices) => {
  return await getGammaPrices(POLYGON_CHAIN_ID, pools, tokenPrices);
};

export default getGammaPolygonPrices;
