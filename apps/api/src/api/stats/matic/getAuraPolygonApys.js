import { addressBook } from 'blockchain-addressbook';
import { balancerPolyClient as client } from '../../../apollo/client.js';
import { POLYGON_CHAIN_ID as chainId } from '../../../constants.js';
import { getAuraApys } from '../common/balancer/getAuraApys.js';

const {
  polygon: {
    platforms: {
      balancer: { router },
    },
  },
} = addressBook;

import pools from '../../../data/matic/auraLpPools.json';

const aaveDataProvider = '0x7F23D86Ee20D869112572136221e173428DD740B';
const auraMinter = '0x8b2970c237656d3895588B99a8bFe977D5618201';

const getAuraPolygonApys = async () => {
  return getAuraApys({
    chainId: chainId,
    client: client,
    pools: pools,
    balancerVault: router,
    aaveDataProvider: aaveDataProvider,
    auraMinter: auraMinter,
    // log: true,
  });
};

export default getAuraPolygonApys;
