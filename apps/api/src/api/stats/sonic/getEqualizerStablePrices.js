import { SONIC_CHAIN_ID } from '../../../constants.js';
import pools from '../../../data/sonic/equalizerStableLpPools.json';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.js';

const stablePools = [...pools];

const getEqualizerStableSonicPrices = async (tokenPrices) => {
  return await getSolidlyStablePrices(SONIC_CHAIN_ID, stablePools, tokenPrices);
};

export default getEqualizerStableSonicPrices;
