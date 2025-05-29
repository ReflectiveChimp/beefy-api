import { LINEA_CHAIN_ID as chainId } from '../../../constants.js';
import gammaPools from '../../../data/linea/lynexGammaPools.json';
import ichiPools from '../../../data/linea/lynexIchiPools.json';
import stablePools from '../../../data/linea/lynexStablePools.json';
import volatilePools from '../../../data/linea/lynexVolatilePools.json';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

const pools = [...ichiPools, ...gammaPools, ...stablePools, ...volatilePools];
export const getLynexApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools.filter((p) => p.gauge),
    oracleId: 'oLYNX',
    oracle: 'tokens',
    decimals: '1e18',
    boosted: false,
    reward: '0x63349BA5E1F71252eCD56E8F950D1A518B400b60',
    // log: true,
  });
};
