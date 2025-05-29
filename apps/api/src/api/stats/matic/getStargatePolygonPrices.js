import { POLYGON_CHAIN_ID as chainId } from '../../../constants.js';
import poolsV2 from '../../../data/matic/stargateV2PolygonPools.json';
import getStargateV2Prices from '../common/stargate/getStargateV2Prices.js';

const getStargatePolygonPrices = async (tokenPrices) => {
  return getStargateV2Prices(chainId, poolsV2, tokenPrices);
};

export default getStargatePolygonPrices;
