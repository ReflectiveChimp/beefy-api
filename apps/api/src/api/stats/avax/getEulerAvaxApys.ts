import { AVAX_CHAIN_ID as chainId } from '../../../constants.js';
import getEulerApyData from '../common/euler/getEulerApys.js';
import type { EulerApyParams } from '../common/euler/getEulerApys.js';

import pools from '../../../data/avax/eulerPools.json'; // TODO as EulerPool[]
const params: EulerApyParams = {
  chainId,
  pools,
  // log: true,
};

const getEulerAvaxApys = async () => {
  return getEulerApyData(params);
};

export { getEulerAvaxApys };
