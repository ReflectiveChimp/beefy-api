import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants.js';
import { getStargateV2Apys } from '../common/stargate/getStargateV2Apys.js';

import poolsV2 from '../../../data/optimism/stargateV2OpPools.json';

const getStargateOpApys = async () => {
  return getStargateV2Apys({
    chainId,
    masterchef: '0xFBb5A71025BEf1A8166C9BCb904a120AA17d6443',
    pools: poolsV2,
    //log: true
  });
};

export default getStargateOpApys;
