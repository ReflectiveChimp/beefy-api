import { KAVA_CHAIN_ID as chainId } from '../../../constants.js';
import { getStargateV2Apys } from '../common/stargate/getStargateV2Apys.js';

import poolsV2 from '../../../data/kava/stargateV2KavaPools.json';

const getStargateKavaApys = async () => {
  return getStargateV2Apys({
    chainId,
    masterchef: '0x10e28bA4D7fc9cf39F34E20bbC5C58694b2f1A92',
    pools: poolsV2,
    //log: true
  });
};

export default getStargateKavaApys;
