import { OPTIMISM_CHAIN_ID } from '../../../constants.js';
import oldPools from '../../../data/optimism/oldVelodromeStableLpPools.json';
import newPools from '../../../data/optimism/velodromeStableLpPools.json';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.js';

const pools = [...oldPools, ...newPools];
const getVelodromeStablePrices = async (tokenPrices) => {
  return await getSolidlyStablePrices(OPTIMISM_CHAIN_ID, pools, tokenPrices);
};

export default getVelodromeStablePrices;
