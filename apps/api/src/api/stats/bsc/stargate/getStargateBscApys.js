import { BSC_CHAIN_ID as chainId } from '../../../../constants.js';
import { getStargateV2Apys } from '../../common/stargate/getStargateV2Apys.js';

import poolsV2 from '../../../../data/bsc/stargateV2BscPools.json';

const getStargateBscApys = async () => {
  return getStargateV2Apys({
    chainId,
    masterchef: '0x26727C78B0209d9E787b2f9ac8f0238B122a3098',
    pools: poolsV2,
    //log: true
  });
};

export default getStargateBscApys;
