import { BASE_CHAIN_ID as chainId } from '../../../constants.js';
import { getMultiRewardMasterChefApys } from '../common/getMultiRewardMasterChefApys.js';

import v3Pools from '../../../data/base/alienBaseBunniPools.json';
import lpPools from '../../../data/base/alienBaseLpPools.json';
const pools = [...lpPools, ...v3Pools];

const getAlienBaseApys = async () =>
  await getMultiRewardMasterChefApys({
    chainId: chainId,
    masterchef: '0x52eaeCAC2402633d98b95213d0b473E069D86590',
    secondsPerBlock: 1,
    pools,
    oracleId: 'ALB',
    oracle: 'tokens',
    decimals: '1e18',
    liquidityProviderFee: 0.0016,
    // log: true,
  });

export default getAlienBaseApys;
