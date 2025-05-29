import { ETH_CHAIN_ID } from '../../../constants.js';
import pools from '../../../data/ethereum/uniswapGammaLpPools.json';
import getGammaPrices from '../common/getGammaPrices.js';

const getUniswapGammaPrices = async (tokenPrices) => {
  return await getGammaPrices(ETH_CHAIN_ID, pools, tokenPrices);
};

export default getUniswapGammaPrices;
