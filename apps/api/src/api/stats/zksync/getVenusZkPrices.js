import { ZKSYNC_CHAIN_ID as chainId } from '../../../constants.js';
import corePools from '../../../data/zksync/venusCorePools.json';
import getVenusPrices from '../common/getVenusPrices.js';

const pools = corePools;

const getVenusArbPrices = async (tokenPrices) => {
  return await getVenusPrices(chainId, pools, tokenPrices);
};

export default getVenusArbPrices;
