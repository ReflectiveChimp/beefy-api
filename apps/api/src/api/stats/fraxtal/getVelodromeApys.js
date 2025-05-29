import { FRAXTAL_CHAIN_ID as chainId } from '../../../constants.js';
import volatilePools from '../../../data/fraxtal/veloLpPools.json';
import stablePools from '../../../data/fraxtal/veloStablePools.json';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

const pools = [...stablePools, ...volatilePools];

export const getVelodromeApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools,
    oracleId: 'VELO',
    oracle: 'tokens',
    decimals: '1e18',
    boosted: false,
    singleReward: true,
    // log: true,
  });
};
