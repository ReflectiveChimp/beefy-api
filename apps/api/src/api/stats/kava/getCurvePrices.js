import { KAVA_CHAIN_ID } from '../../../constants.js';
import pools from '../../../data/kava/curvePools.json';
import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.js';

const getCurveKavaPrices = async (tokenPrices) => {
  return await getCurvePricesCommon(KAVA_CHAIN_ID, pools, tokenPrices);
};

export default getCurveKavaPrices;
