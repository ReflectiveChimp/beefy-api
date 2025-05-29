import { addressBook } from 'blockchain-addressbook';
import { balancerBaseClient as client } from '../../../apollo/client.js';
import { BASE_CHAIN_ID as chainId } from '../../../constants.js';
import { getAuraApys } from '../common/balancer/getAuraApys.js';

const {
  base: {
    platforms: { balancer },
  },
} = addressBook;

import auraLpPools from '../../../data/base/auraLpPools.json';
import auraV3pools from '../../../data/base/auraV3pools.json';
const pools = [...auraLpPools, ...auraV3pools];

const aaveDataProvider = '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654';
const auraMinter = '0x8b2970c237656d3895588B99a8bFe977D5618201';

const getAuraBaseApys = async () => {
  return getAuraApys({
    chainId: chainId,
    client: client,
    pools: pools,
    balancerVault: balancer.router,
    aaveDataProvider: aaveDataProvider,
    auraMinter: auraMinter,
    // log: true,
  });
};

export default getAuraBaseApys;
