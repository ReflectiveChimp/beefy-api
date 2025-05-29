import { LINEA_CHAIN_ID as chainId } from '../../../constants.js';
import stablePools from '../../../data/linea/nileStablePools.json';
import volatilePools from '../../../data/linea/nileVolatilePools.json';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

const pools = [...stablePools, ...volatilePools];
export const getNileApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'NILE',
    oracle: 'tokens',
    decimals: '1e18',
    reward: '0xAAAac83751090C6ea42379626435f805DDF54DC8',
    ramses: true,
    // log: true,
  });
};
