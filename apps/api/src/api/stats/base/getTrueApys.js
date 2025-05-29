import { BASE_CHAIN_ID as chainId } from '../../../constants.js';
import trueLpPools from '../../../data/base/trueLpPools.json';
import truePools from '../../../data/base/truePools.json';
import { getRewardPoolApys } from '../common/getRewardPoolApys.js';

const pools = [...trueLpPools, ...truePools];

const getTrueApys = async () => {
  return getRewardPoolApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'TRUE',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });
};

export { getTrueApys };
