import { LISK_CHAIN_ID } from '../../../constants.js';
import pools from '../../../data/lisk/velodromeLiskStablePools.json';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.js';

const getVelodromeLiskStablePrices = async (tokenPrices) => {
  return await getSolidlyStablePrices(LISK_CHAIN_ID, pools, tokenPrices);
};

export default getVelodromeLiskStablePrices;
