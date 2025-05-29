import { addressBook } from 'blockchain-addressbook';
import { FRAXTAL_CHAIN_ID as chainId } from '../../../constants.js';
import volatilePools from '../../../data/fraxtal/raPools.json';
import stablePools from '../../../data/fraxtal/raStablePools.json';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

const {
  fraxtal: {
    tokens: { FXS },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getRaApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'FXS',
    oracle: 'tokens',
    decimals: '1e18',
    reward: FXS.address,
    ramses: true,
    // log: true,
  });
};

export default getRaApys;
