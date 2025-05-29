import { FANTOM_CHAIN_ID } from '../../../constants.js';
import beetsDualPools from '../../../data/fantom/beethovenxDualPools.json';
import beetsPools from '../../../data/fantom/beethovenxPools.json';
import getBalancerPrices from '../common/balancer/getBalancerPrices.js';

const pools = [...beetsPools, ...beetsDualPools];

const getBeethovenxPrices = async (tokenPrices: Record<string, number>) => {
  return await getBalancerPrices(FANTOM_CHAIN_ID, pools, tokenPrices);
};

export default getBeethovenxPrices;
