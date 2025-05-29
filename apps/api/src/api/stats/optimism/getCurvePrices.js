import { OPTIMISM_CHAIN_ID } from '../../../constants.js';
import pools from '../../../data/optimism/curvePools.json';
import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.js';

const getCurveOptimismPrices = async (tokenPrices) => {
  return await getCurvePricesCommon(OPTIMISM_CHAIN_ID, pools, tokenPrices);
};

export default getCurveOptimismPrices;
