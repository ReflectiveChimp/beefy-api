import { SONIC_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/sonic/siloPools.json';
import { getSiloApyData, validateSiloPools } from '../common/getSiloApys.js';
import type { SiloApyParams } from '../common/getSiloApys.js';

const params: SiloApyParams = {
  chainId,
  pools: validateSiloPools(pools),
  // log: true,
};

const getSonicSiloApys = async () => {
  return getSiloApyData(params);
};

export { getSonicSiloApys };
