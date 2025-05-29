import { FRAXTAL_CHAIN_ID as chainId } from '../../../constants.js';
import curvePools from '../../../data/fraxtal/curvePools.json';
import { getConvexApyData } from '../common/curve/getConvexApyData.js';
import { getCurveGetBaseApys } from '../common/curve/getCurveApyData.js';
import getApyBreakdown from '../common/getApyBreakdown.js';

const pools = curvePools.filter((p) => p.convex);
const baseApyUrl = 'https://api.curve.finance/v1/getBaseApys/fraxtal';
const tradingFees = 0.0002;

export const getConvexApys = async () => {
  const [baseApys, farmApys] = await Promise.all([
    getCurveGetBaseApys(pools, baseApyUrl),
    getConvexApyData(chainId, pools),
  ]);
  const poolsMap = pools.map((p) => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};
