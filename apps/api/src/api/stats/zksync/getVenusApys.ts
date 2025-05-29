import { ZKSYNC_CHAIN_ID as chainId } from '../../../constants.js';
import getVenusApyData from '../common/getVenusApys.js';
import type { VenusApyParams } from '../common/getVenusApys.js';

import corePools from '../../../data/zksync/venusCorePools.json'; // TODO as VenusPool[]

const coreParams: VenusApyParams = {
  chainId,
  comptroller: '0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1',
  compOracleId: 'zkXVS',
  pools: corePools,
};

const getVenusApys = async () => {
  return await getVenusApyData(coreParams);
};

export default getVenusApys;
