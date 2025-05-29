import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants.js';
import poolsV2 from '../../../data/arbitrum/stargateV2ArbPools.json';
import getStargateV2Prices from '../common/stargate/getStargateV2Prices.js';

const getStargateArbPrices = async (tokenPrices) => {
  return getStargateV2Prices(chainId, poolsV2, tokenPrices);
};

export default getStargateArbPrices;
