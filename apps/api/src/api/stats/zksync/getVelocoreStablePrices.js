import { ZKSYNC_CHAIN_ID } from '../../../constants.js';
import pools from '../../../data/zksync/velocoreStableLpPools.json';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.js';

const getVelocoreStablePrices = async (tokenPrices) => {
  return await getSolidlyStablePrices(ZKSYNC_CHAIN_ID, pools, tokenPrices);
};

export default getVelocoreStablePrices;
