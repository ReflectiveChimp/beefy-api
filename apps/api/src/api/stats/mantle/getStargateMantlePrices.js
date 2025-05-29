import { MANTLE_CHAIN_ID as chainId } from '../../../constants.js';
import poolsV2 from '../../../data/mantle/stargateV2MantlePools.json';
import getStargateV2Prices from '../common/stargate/getStargateV2Prices.js';

const getStargateMantlePrices = async (tokenPrices) => {
  return getStargateV2Prices(chainId, poolsV2, tokenPrices);
};

export default getStargateMantlePrices;
