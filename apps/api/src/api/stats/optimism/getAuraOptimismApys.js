import { addressBook } from 'blockchain-addressbook';
import { beetOpClient as client } from '../../../apollo/client.js';
import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants.js';
import { getAuraApys } from '../common/balancer/getAuraApys.js';

const {
  optimism: {
    platforms: { beethovenX },
  },
} = addressBook;

import pools from '../../../data/optimism/auraLpPools.json';

const aaveDataProvider = '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654';
const auraMinter = '0xeC1c780A275438916E7CEb174D80878f29580606';

const getAuraOptimismApys = async () => {
  return getAuraApys({
    chainId: chainId,
    client: client,
    pools: pools,
    balancerVault: beethovenX.router,
    aaveDataProvider: aaveDataProvider,
    auraMinter: auraMinter,
    // log: true,
  });
};

export default getAuraOptimismApys;
