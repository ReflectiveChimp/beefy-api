import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants.js';
import auraPools from '../../../data/optimism/auraLpPools.json';
import balancerPools from '../../../data/optimism/balancerOpLpPools.json';
import beetsPools from '../../../data/optimism/beethovenxLpPools.json';
import getBalancerPrices from '../common/balancer/getBalancerPrices.js';

const pools = [...beetsPools, ...balancerPools, ...auraPools];

const getBeetsOPPrices = async (tokenPrices: Record<string, number>) => {
  return await getBalancerPrices(chainId, pools, tokenPrices);
};

export default getBeetsOPPrices;
