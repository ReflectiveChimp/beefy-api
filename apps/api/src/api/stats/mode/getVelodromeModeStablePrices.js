import { MODE_CHAIN_ID } from '../../../constants.js';
import pools from '../../../data/mode/velodromeModeStablePools.json';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.js';

const getVelodromeModeStablePrices = async (tokenPrices) => {
  return await getSolidlyStablePrices(MODE_CHAIN_ID, pools, tokenPrices);
};

export default getVelodromeModeStablePrices;
