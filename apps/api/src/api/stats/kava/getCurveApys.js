import { KAVA_CHAIN_ID as chainId } from '../../../constants.js';
import curvePools from '../../../data/kava/curvePools.json';
import { getCurveBaseApysOld } from '../common/curve/getCurveApyData.js';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon.js';
import getApyBreakdown from '../common/getApyBreakdown.js';

const pools = curvePools.filter((p) => p.gauge && !p.convex);
const factoryApyUrl = 'https://api.curve.finance/api/getFactoryAPYs-kava';
const tradingFees = 0.0002;

export const getCurveApys = async () => {
  const [baseApys, farmApys] = await Promise.all([
    getCurveBaseApysOld(pools, false, factoryApyUrl),
    getCurveApysCommon(chainId, pools),
  ]);
  const poolsMap = pools.map((p) => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};
