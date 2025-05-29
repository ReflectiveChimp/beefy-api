import { BSC_CHAIN_ID as chainId } from '../../../../constants.js';
import poolsV2 from '../../../../data/bsc/stargateV2BscPools.json';
import getStargateV2Prices from '../../common/stargate/getStargateV2Prices.js';

const getStargateBscPrices = async (tokenPrices) => {
  return getStargateV2Prices(chainId, poolsV2, tokenPrices);
};

export default getStargateBscPrices;
