import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants.js';
import corePools from '../../../data/arbitrum/venusCorePools.json';
import lsPools from '../../../data/arbitrum/venusLsPools.json';
import getVenusPrices from '../common/getVenusPrices.js';

const pools = [...corePools, ...lsPools];

const getVenusArbPrices = async (tokenPrices) => {
  return await getVenusPrices(chainId, pools, tokenPrices);
};

export default getVenusArbPrices;
