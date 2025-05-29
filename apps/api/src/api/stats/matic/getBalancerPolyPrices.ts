import { POLYGON_CHAIN_ID as chainId } from '../../../constants.js';
import auraPools from '../../../data/matic/auraLpPools.json';
import balancerPools from '../../../data/matic/balancerPolyLpPools.json';
import getBalancerPrices from '../common/balancer/getBalancerPrices.js';

const pools = [...balancerPools, ...auraPools];

const getBalancerPolyPrices = async (tokenPrices: Record<string, number>) => {
  return await getBalancerPrices(chainId, pools, tokenPrices);
};

export default getBalancerPolyPrices;
