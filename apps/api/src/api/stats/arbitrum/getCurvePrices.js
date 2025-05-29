import { ARBITRUM_CHAIN_ID } from '../../../constants.js';
import pools from '../../../data/arbitrum/curvePools.json';
import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.js';

const getCurveArbitrumPrices = async (tokenPrices) => {
  return await getCurvePricesCommon(ARBITRUM_CHAIN_ID, pools, tokenPrices);
};

export default getCurveArbitrumPrices;
