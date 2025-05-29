import { AVAX_CHAIN_ID as chainId } from '../../../constants.js';
import poolsV2 from '../../../data/avax/stargateV2AvaxPools.json';
import getStargateV2Prices from '../common/stargate/getStargateV2Prices.js';

const getStargateAvaxPrices = async (tokenPrices) => {
  return getStargateV2Prices(chainId, poolsV2, tokenPrices);
};

export default getStargateAvaxPrices;
