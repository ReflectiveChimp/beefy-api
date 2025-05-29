import { KAVA_CHAIN_ID as chainId } from '../../../constants.js';
import { getEDecimals } from '../../../utils/getEDecimals.js';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

import { addressBook } from 'blockchain-addressbook';
import volatilePools from '../../../data/kava/equilibreLpPools.json';
import stablePools from '../../../data/kava/equilibreStableLpPools.json';
const {
  kava: {
    tokens: { VARA },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getEquilibreApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'VARA',
    oracle: 'tokens',
    decimals: getEDecimals(VARA.decimals),
    reward: VARA.address,
    boosted: false,
    // log: true,
  });
};

export default getEquilibreApys;
