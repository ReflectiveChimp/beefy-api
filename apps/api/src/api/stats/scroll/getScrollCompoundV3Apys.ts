import { SCROLL_CHAIN_ID as chainId } from '../../../constants.js';
import getCompoundV3ApyData from '../common/getCompoundV3Apys.js';
import type { CompoundV3ApyParams } from '../common/getCompoundV3Apys.js';

import pools from '../../../data/scroll/compoundPools.json'; // TODO as CompoundV3Pool[]
const params: CompoundV3ApyParams = {
  chainId,
  pools,
  compOracleId: 'COMP',
  secondsPerBlock: 1, // Sonne reports rates per second, not pet block
  //log: true,
};

const getScrollCompoundV3Apys = async () => {
  return getCompoundV3ApyData(params);
};

export { getScrollCompoundV3Apys };
