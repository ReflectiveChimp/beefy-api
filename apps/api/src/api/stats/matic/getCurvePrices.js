import { POLYGON_CHAIN_ID } from '../../../constants.js';
import pools from '../../../data/matic/curvePools.json';
import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.js';

const getCurvePolygonPrices = async (tokenPrices) => {
  return await getCurvePricesCommon(POLYGON_CHAIN_ID, pools, tokenPrices);
};

export default getCurvePolygonPrices;
