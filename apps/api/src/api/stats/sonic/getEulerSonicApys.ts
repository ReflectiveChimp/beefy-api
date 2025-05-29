import { SONIC_CHAIN_ID as chainId } from '../../../constants.js';
import getEulerApyData from '../common/euler/getEulerApys.js';
import type { EulerApyParams } from '../common/euler/getEulerApys.js';

import pools from '../../../data/sonic/eulerPools.json'; // TODO as EulerPool[]
const params: EulerApyParams = {
  chainId,
  pools,
  // log: true,
};

const getEulerSonicApys = async () => {
  return getEulerApyData(params);
};

export { getEulerSonicApys };
