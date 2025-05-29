import { FRAXTAL_CHAIN_ID as chainId } from '../../../constants.js';
import { getConvexApyData } from '../common/curve/getConvexApyData.js';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon.js';
import { getCurveLendSupplyApys } from '../common/curve/getCurveLendSupplyApys.js';
import getApyBreakdown from '../common/getApyBreakdown.js';

import pools from '../../../data/fraxtal/curveLendPools.json';

export const getCurveLendApys = async () => {
  const curvePools = pools.filter((p) => !p.convex);
  const convexPools = pools.filter((p) => p.convex);

  const [baseApys, curveApys, convexApys] = await Promise.all([
    await getCurveLendSupplyApys(chainId, pools),
    await getCurveApysCommon(chainId, curvePools),
    await getConvexApyData(chainId, convexPools),
  ]);
  const poolsMap = pools.map((p) => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, [...curveApys, ...convexApys]);
};
