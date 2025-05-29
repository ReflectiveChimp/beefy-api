import { ETH_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/ethereum/tokemakPools.json';
import getTokemakPrices from '../common/getTokemakPrices.js';

const getTokemakEthPrices = async (tokenPrices: Record<string, number>) => {
  return await getTokemakPrices(chainId, pools, tokenPrices);
};

export default getTokemakEthPrices;
