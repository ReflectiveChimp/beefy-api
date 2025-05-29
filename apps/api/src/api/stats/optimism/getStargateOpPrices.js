import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants.js';
import poolsV2 from '../../../data/optimism/stargateV2OpPools.json';
import getStargateV2Prices from '../common/stargate/getStargateV2Prices.js';

const getStargateOpPrices = async (tokenPrices) => {
  return getStargateV2Prices(chainId, poolsV2, tokenPrices);
};

export default getStargateOpPrices;
