import { SCROLL_CHAIN_ID as chainId } from '../../../constants.js';
import stablePools from '../../../data/scroll/nuriStablePools.json';
import volatilePools from '../../../data/scroll/nuriVolatilePools.json';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

const pools = [...stablePools, ...volatilePools];
export const getNuriApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'NURI',
    oracle: 'tokens',
    decimals: '1e18',
    reward: '0xAAAE8378809bb8815c08D3C59Eb0c7D1529aD769',
    ramses: true,
    // log: true,
  });
};
