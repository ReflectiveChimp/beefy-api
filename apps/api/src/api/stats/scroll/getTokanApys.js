import { SCROLL_CHAIN_ID as chainId } from '../../../constants.js';
import stablePools from '../../../data/scroll/tokanStablePools.json';
import volatilePools from '../../../data/scroll/tokanVolatilePools.json';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

const pools = [...stablePools, ...volatilePools];
export const getTokanApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'TKN',
    oracle: 'tokens',
    decimals: '1e18',
    reward: '0x1a2fCB585b327fAdec91f55D45829472B15f17a4',
    singleReward: true,
    // log: true,
  });
};
