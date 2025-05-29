import { ZKSYNC_CHAIN_ID as chainId } from '../../../constants.js';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

import { addressBook } from 'blockchain-addressbook';
import volatilePools from '../../../data/zksync/velocoreLpPools.json';
import stablePools from '../../../data/zksync/velocoreStableLpPools.json';
const {
  zksync: {
    tokens: { VC },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getVelocoreApys = async () =>
  getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'VC',
    oracle: 'tokens',
    decimals: '1e18',
    reward: VC.address,
    boosted: false,
    // log: true,
  });

export default getVelocoreApys;
