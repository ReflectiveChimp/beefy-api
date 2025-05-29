import { POLYGON_CHAIN_ID as chainId } from '../../../constants.js';
import { getStargateV2Apys } from '../common/stargate/getStargateV2Apys.js';

import poolsV2 from '../../../data/matic/stargateV2PolygonPools.json';

const getStargatePolygonApys = async () => {
  return getStargateV2Apys({
    chainId,
    masterchef: '0x4694900bDbA99Edf07A2E46C4093f88F9106a90D',
    pools: poolsV2,
    //log: true
  });
};

export default getStargatePolygonApys;
