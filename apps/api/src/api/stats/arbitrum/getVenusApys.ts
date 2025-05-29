import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants.js';
import getVenusApyData, { type VenusApyParams } from '../common/getVenusApys.js';

import corePools from '../../../data/arbitrum/venusCorePools.json'; // TODO as VenusPool[]
import lsPools from '../../../data/arbitrum/venusLsPools.json'; // TODO as VenusPool[]

const coreParams: VenusApyParams = {
  chainId,
  comptroller: '0x317c1A5739F39046E20b08ac9BeEa3f10fD43326',
  compOracleId: 'arbXVS',
  pools: corePools,
};
const lsParams: VenusApyParams = {
  chainId,
  comptroller: '0x52bAB1aF7Ff770551BD05b9FC2329a0Bf5E23F16',
  compOracleId: 'arbXVS',
  pools: lsPools,
};

const getVenusApys = async () => {
  const [coreApys, lsApys] = await Promise.all([getVenusApyData(coreParams), getVenusApyData(lsParams)]);

  const apys = { ...coreApys.apys, ...lsApys.apys };
  const apyBreakdowns = { ...coreApys.apyBreakdowns, ...lsApys.apyBreakdowns };

  return { apys: apys, apyBreakdowns: apyBreakdowns };
};

export default getVenusApys;
