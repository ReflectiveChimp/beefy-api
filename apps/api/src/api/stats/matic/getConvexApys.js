import { POLYGON_CHAIN_ID } from '../../../constants.js';
import curvePools from '../../../data/matic/curvePools.json';
import { getConvexApyData } from '../common/curve/getConvexApyData.js';
import { getCurveSubgraphApys } from '../common/curve/getCurveApyData.js';
import getApyBreakdown from '../common/getApyBreakdown.js';

const pools = curvePools.filter((p) => p.convex);
const baseApyUrl = 'https://api.curve.finance/api/getSubgraphData/polygon';
const tradingFees = 0.0002;

export const getConvexApys = async () => {
  const [baseApys, farmApys] = await Promise.all([
    getCurveSubgraphApys(pools, baseApyUrl),
    getConvexApyData(POLYGON_CHAIN_ID, pools),
  ]);
  const poolsMap = pools.map((p) => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};
