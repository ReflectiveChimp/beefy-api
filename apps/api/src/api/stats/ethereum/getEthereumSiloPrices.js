import { ETH_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/ethereum/siloPools.json';
import getSiloPrices from '../common/getSiloPrices.js';

const getEthSiloPrices = async (tokenPrices) => {
  return await getSiloPrices(chainId, pools, tokenPrices);
};

export default getEthSiloPrices;
