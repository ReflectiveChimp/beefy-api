import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/arbitrum/siloPools.json';
import getSiloPrices from '../common/getSiloPrices.js';

const getArbitrumSiloPrices = async (tokenPrices) => {
  return await getSiloPrices(chainId, pools, tokenPrices);
};

export default getArbitrumSiloPrices;
