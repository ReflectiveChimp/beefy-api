import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants.js';
import { getSiloApyData } from '../common/getSiloApys.js';
import type { SiloApyParams } from '../common/getSiloApys.js';

import pools from '../../../data/arbitrum/siloPools.json'; // TODO as SiloPool[]
const params: SiloApyParams = {
  chainId,
  pools,
  // log: true,
};

const getArbSiloApys = async () => {
  return getSiloApyData(params);
};

export { getArbSiloApys };
