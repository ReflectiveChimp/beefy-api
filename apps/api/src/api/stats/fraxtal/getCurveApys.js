import { FRAXTAL_CHAIN_ID as chainId } from '../../../constants.js';
import curvePools from '../../../data/fraxtal/curvePools.json';
import { getCurveGetBaseApys } from '../common/curve/getCurveApyData.js';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon.js';
import getApyBreakdown from '../common/getApyBreakdown.js';

const pools = curvePools.filter((p) => p.gauge && !p.convex);
const subgraphApyUrl = 'https://api.curve.finance/api/getSubgraphData/fraxtal';
const baseApyUrl = 'https://api.curve.finance/v1/getBaseApys/fraxtal';
const tradingFees = 0.0002;

export const getCurveApys = async () => {
  const [baseApys, farmApys] = await Promise.all([
    getCurveGetBaseApys(pools, baseApyUrl),
    getCurveApysCommon(chainId, pools),
  ]);
  const poolsMap = pools.map((p) => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};
