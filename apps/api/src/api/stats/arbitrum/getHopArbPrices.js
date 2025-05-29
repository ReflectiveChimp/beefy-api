import { ARBITRUM_CHAIN_ID } from '../../../constants.js';
import hopPools from '../../../data/arbitrum/hopPools.json';
import rplPools from '../../../data/arbitrum/hopRplPools.json';
import getStableSwapPrices from '../common/getStableSwapPrices.js';

const pools = [...hopPools, ...rplPools];

const getHopArbPrices = async (tokenPrices) => {
  return await getStableSwapPrices(ARBITRUM_CHAIN_ID, pools, tokenPrices);
};

export default getHopArbPrices;
