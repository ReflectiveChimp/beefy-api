import { SONIC_CHAIN_ID as chainId } from '../../../constants.js';
import { getBalancerApys } from '../common/balancer/getBalancerApys.js';

import pools from '../../../data/sonic/beetsPools.json';
import beetsV3Pools from '../../../data/sonic/beetsV3Pools.json';

const getBeetsSonicApys = async () => {
  return getBalancerApys({
    chainId: chainId,
    pools: [...pools, ...beetsV3Pools],
    balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    // log: true,
  });
};

export default getBeetsSonicApys;
