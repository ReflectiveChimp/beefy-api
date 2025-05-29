import { BASE_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/base/curvePools.json';
import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.js';

export const getCurveBasePrices = async (tokenPrices) => {
  return await getCurvePricesCommon(chainId, pools, tokenPrices);
};
