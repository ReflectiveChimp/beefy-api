import { addressBook } from 'blockchain-addressbook';
import { balancerArbClient as client } from '../../../apollo/client.js';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants.js';
import balancerPools from '../../../data/arbitrum/balancerArbLpPools.json';
import balancerV3Pools from '../../../data/arbitrum/balancerV3Pools.json';
import { getBalancerApys } from '../common/balancer/getBalancerApys.js';

const {
  arbitrum: {
    platforms: { balancer },
  },
} = addressBook;

const pools = [...balancerPools, ...balancerV3Pools];

const aaveDataProvider = '0x7F23D86Ee20D869112572136221e173428DD740B';

const getBalancerArbApys = async () => {
  return getBalancerApys({
    chainId: chainId,
    client: client,
    pools: pools,
    balancerVault: balancer.router,
    aaveDataProvider: aaveDataProvider,
    // log: true,
  });
};

export default getBalancerArbApys;
