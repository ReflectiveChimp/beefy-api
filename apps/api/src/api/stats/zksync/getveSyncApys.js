import { ZKSYNC_CHAIN_ID as chainId } from '../../../constants.js';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

import { addressBook } from 'blockchain-addressbook';
import volatilePools from '../../../data/zksync/veSyncLpPools.json';
const {
  zksync: {
    tokens: { VS },
  },
} = addressBook;

const pools = [...volatilePools];
const getveSyncApys = async () =>
  getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'VSzk',
    oracle: 'tokens',
    decimals: '1e18',
    reward: VS.address,
    boosted: false,
    // log: true,
  });

export default getveSyncApys;
