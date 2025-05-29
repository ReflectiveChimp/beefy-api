import { BERACHAIN_CHAIN_ID as chainId } from '../../../constants.js';
import beraswapPools from '../../../data/berachain/beraswapPools.json';
import beraPawPools from '../../../data/berachain/hubBeraPawPools.json';
import getBalancerPrices from '../common/balancer/getBalancerPrices.js';

export const getBeraswapPrices = async (tokenPrices) => {
  return getBalancerPrices(chainId, [...beraswapPools, ...beraPawPools], tokenPrices);
};
