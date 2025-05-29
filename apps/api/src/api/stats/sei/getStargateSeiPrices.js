import { SEI_CHAIN_ID as chainId } from '../../../constants.js';
import poolsV2 from '../../../data/sei/stargateV2SeiPools.json';
import getStargateV2Prices from '../common/stargate/getStargateV2Prices.js';

const getStargateSeiPrices = async (tokenPrices) => {
  return getStargateV2Prices(chainId, poolsV2, tokenPrices);
};

export default getStargateSeiPrices;
