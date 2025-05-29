import { AVAX_CHAIN_ID as chainId } from '../../../constants.js';
import { getStargateV2Apys } from '../common/stargate/getStargateV2Apys.js';

import poolsV2 from '../../../data/avax/stargateV2AvaxPools.json';

const getStargateAvaxApys = async () => {
  return getStargateV2Apys({
    chainId,
    masterchef: '0x8db623d439C8c4DFA1Ca94E4CD3eB8B3Aaff8331',
    pools: poolsV2,
    //log: true
  });
};

export default getStargateAvaxApys;
