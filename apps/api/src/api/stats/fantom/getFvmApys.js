import { FANTOM_CHAIN_ID as chainId } from '../../../constants.js';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

import { addressBook } from 'blockchain-addressbook';
import volatilePools from '../../../data/fantom/fvmLpPools.json';

const { FVM } = addressBook.fantom.tokens;

const pools = volatilePools;
const getFvmApys = async () =>
  getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'oFVM',
    oracle: 'tokens',
    decimals: '1e18',
    reward: FVM.address,
    // log: true,
  });

export default getFvmApys;
