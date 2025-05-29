import { LINEA_CHAIN_ID as chainId } from '../../../constants.js';
import { getStargateV2Apys } from '../common/stargate/getStargateV2Apys.js';

import poolsV2 from '../../../data/linea/stargateV2LineaPools.json';

const getStargateLineaApys = async () => {
  return getStargateV2Apys({
    chainId,
    masterchef: '0x25BBf59ef9246Dc65bFac8385D55C5e524A7B9eA',
    pools: poolsV2,
    //log: true
  });
};

export default getStargateLineaApys;
