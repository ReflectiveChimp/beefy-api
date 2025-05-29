import { MANTLE_CHAIN_ID as chainId } from '../../../constants.js';
import { getStargateV2Apys } from '../common/stargate/getStargateV2Apys.js';

import poolsV2 from '../../../data/mantle/stargateV2MantlePools.json';

const getStargateMantleApys = async () => {
  return getStargateV2Apys({
    chainId,
    masterchef: '0x02DC1042E623A8677B002981164ccc05d25d486a',
    pools: poolsV2,
    //log: true
  });
};

export default getStargateMantleApys;
