import { ETH_CHAIN_ID as chainId } from '../../../constants.js';
import poolsV2 from '../../../data/ethereum/stargateV2EthPools.json';
import getStargateV2Prices from '../common/stargate/getStargateV2Prices.js';

const getStargateEthPrices = async (tokenPrices) => {
  return getStargateV2Prices(chainId, poolsV2, tokenPrices);
};

export default getStargateEthPrices;
