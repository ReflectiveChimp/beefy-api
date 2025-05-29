import { BASE_CHAIN_ID as chainId } from '../../../constants.js';
import volatilePools from '../../../data/base/aerodromeLpPools.json';
import stablePools from '../../../data/base/aerodromeStableLpPools.json';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

const pools = [...stablePools, ...volatilePools];
export const getAerodromeApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools.filter((p) => p.gauge),
    oracleId: 'AERO',
    oracle: 'tokens',
    decimals: '1e18',
    boosted: false,
    singleReward: true,
    // log: true,
  });
};
