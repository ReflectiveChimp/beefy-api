import { addressBook } from 'blockchain-addressbook';
import { balancerPolyClient as client } from '../../../apollo/client.js';
import { POLYGON_CHAIN_ID as chainId } from '../../../constants.js';
import { getBalancerApys } from '../common/balancer/getBalancerApys.js';

const {
  polygon: {
    platforms: { balancer },
  },
} = addressBook;

import pools from '../../../data/matic/balancerPolyLpPools.json';

const aaveDataProvider = '0x7F23D86Ee20D869112572136221e173428DD740B';

const getBalancerPolyApys = async () => {
  return getBalancerApys({
    chainId: chainId,
    client: client,
    pools: pools,
    balancerVault: balancer.router,
    aaveDataProvider: aaveDataProvider,
    // log: true,
  });
};

export default getBalancerPolyApys;
