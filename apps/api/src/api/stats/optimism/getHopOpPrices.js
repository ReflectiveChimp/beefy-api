import { OPTIMISM_CHAIN_ID } from '../../../constants.js';
import opPools from '../../../data/optimism/hopOpPools.json';
import hopPools from '../../../data/optimism/hopPools.json';
import getStableSwapPrices from '../common/getStableSwapPrices.js';

const pools = [...hopPools, ...opPools];

const getHopOpPrices = async (tokenPrices) => {
  return await getStableSwapPrices(OPTIMISM_CHAIN_ID, pools, tokenPrices);
};

export default getHopOpPrices;
