import { BSC_CHAIN_ID as chainId } from '../../../constants.js';
import gammaPools from '../../../data/bsc/thenaGammaPools.json';
import volatilePools from '../../../data/bsc/thenaLpPools.json';
import stablePools from '../../../data/bsc/thenaStableLpPools.json';
import { getRewardPoolApys } from '../common/getRewardPoolApys.js';

const pools = [...stablePools, ...volatilePools, ...gammaPools];
const getThenaApys = async () => {
  return getRewardPoolApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'THE',
    oracle: 'tokens',
    decimals: '1e18', // token is 1e18 but gauge.rewardRate returns 1e36
    // log: true,
  });
};

export default getThenaApys;
