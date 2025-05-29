import { LINEA_CHAIN_ID as chainId } from '../../../constants.js';
import poolsV2 from '../../../data/linea/stargateV2LineaPools.json';
import getStargateV2Prices from '../common/stargate/getStargateV2Prices.js';

const getStargateLineaPrices = async (tokenPrices) => {
  return getStargateV2Prices(chainId, poolsV2, tokenPrices);
};

export default getStargateLineaPrices;
