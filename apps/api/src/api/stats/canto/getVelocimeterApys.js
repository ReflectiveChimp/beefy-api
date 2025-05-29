import { CANTO_CHAIN_ID as chainId } from '../../../constants.js';
import { getEDecimals } from '../../../utils/getEDecimals.js';

import volatileV2Pools from '../../../data/canto/velocimeterV2LpPools.json';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

import { addressBook } from 'blockchain-addressbook';

const {
  canto: {
    tokens: { FLOW },
  },
} = addressBook;

const poolsV2 = [...volatileV2Pools];
const getVelocimeterApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: poolsV2,
    oracleId: 'FLOW',
    oracle: 'tokens',
    decimals: getEDecimals(FLOW.decimals),
    reward: FLOW.address,
    boosted: false,
    // log: true,
  });
};

export default getVelocimeterApys;
