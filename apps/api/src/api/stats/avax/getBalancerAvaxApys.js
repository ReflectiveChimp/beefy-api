import { addressBook } from 'blockchain-addressbook';
import { balancerAvaxClient as client } from '../../../apollo/client.js';
import { AVAX_CHAIN_ID as chainId } from '../../../constants.js';
import { getBalancerApys } from '../common/balancer/getBalancerApys.js';

const {
  avax: {
    platforms: { balancer },
  },
} = addressBook;

import balancerPools from '../../../data/avax/balancerLpPools.json';
import balancerV3Pools from '../../../data/avax/balancerV3Pools.json';
const pools = [...balancerPools, ...balancerV3Pools];

const aaveDataProvider = '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654';

const getBalancerAvaxApys = async () => {
  return getBalancerApys({
    chainId: chainId,
    client: client,
    pools: pools,
    balancerVault: balancer.router,
    aaveDataProvider: aaveDataProvider,
    // log: true,
  });
};

export default getBalancerAvaxApys;
