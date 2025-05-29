import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants.js';
import getCompoundV2ApyData from '../common/getCompoundV2Apys.js';
import type { CompoundV2ApyParams } from '../common/getCompoundV2Apys.js';

import pools from '../../../data/optimism/sonnePools.json'; // TODO as CompoundV2Pool[]
const params: CompoundV2ApyParams = {
  chainId,
  pools,
  comptroller: '0x60CF091cD3f50420d50fD7f707414d0DF4751C58',
  compOracleId: 'SONNE',
  secondsPerBlock: 1,
  // log: true,
};

const getSonneApys = async () => {
  return getCompoundV2ApyData(params);
};

export { getSonneApys };
