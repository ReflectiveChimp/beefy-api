import { ETH_CHAIN_ID as chainId } from '../../../constants.js';
import getCompoundV3ApyData from '../common/getCompoundV3Apys.js';
import type { CompoundV3ApyParams } from '../common/getCompoundV3Apys.js';

import pools from '../../../data/ethereum/compoundPools.json'; // TODO as CompoundV3Pool[]
const params: CompoundV3ApyParams = {
  chainId,
  pools,
  compOracleId: 'COMP',
  secondsPerBlock: 1, //  rates per second, not pet block
  //log: true,
};

const getETHCompoundV3Apys = async () => {
  return getCompoundV3ApyData(params);
};

export { getETHCompoundV3Apys };
