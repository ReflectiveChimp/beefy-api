import { addressBook } from 'blockchain-addressbook';
import { beetOpClient as client } from '../../../apollo/client.js';
import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants.js';
import { getBalancerApys } from '../common/balancer/getBalancerApys.js';

const {
  optimism: {
    platforms: { beethovenX },
  },
} = addressBook;

import pools from '../../../data/optimism/balancerOpLpPools.json';

const aaveDataProvider = '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654';

const getBalancerOpApys = async () => {
  return getBalancerApys({
    chainId: chainId,
    client: client,
    pools: pools,
    balancerVault: beethovenX.router,
    aaveDataProvider: aaveDataProvider,
    // log: true,
  });
};

export default getBalancerOpApys;
