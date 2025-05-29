import { ZKSYNC_CHAIN_ID as chainId } from '../../../constants.js';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

import { addressBook } from 'blockchain-addressbook';
import volatilePools from '../../../data/zksync/draculaLpPools.json';
const {
  zksync: {
    tokens: { FANG },
  },
} = addressBook;

const pools = [...volatilePools];
const getDraculaApys = async () =>
  getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'FANG',
    oracle: 'tokens',
    decimals: '1e36',
    reward: FANG.address,
    // log: true,
  });

export default getDraculaApys;
