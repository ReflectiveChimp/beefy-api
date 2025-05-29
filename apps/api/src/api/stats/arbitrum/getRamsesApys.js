import { addressBook } from 'blockchain-addressbook';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants.js';
import volatilePools from '../../../data/arbitrum/ramsesLpPools.json';
import stablePools from '../../../data/arbitrum/ramsesStableLpPools.json';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

const {
  arbitrum: {
    platforms: { ramses },
    tokens: { RAM },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getRamsesApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'RAM',
    oracle: 'tokens',
    decimals: '1e18',
    reward: RAM.address,
    spirit: false,
    // log: true,
  });
};

export default getRamsesApys;
