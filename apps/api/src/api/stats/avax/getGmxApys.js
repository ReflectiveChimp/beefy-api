import { AVAX_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/avax/gmxPools.json';
import trackers from '../../../data/avax/gmxTrackers.json';
import { getGmxCommonApys } from '../common/gmx/getGmxApys.js';

export const getGmxApys = async () =>
  await getGmxCommonApys({
    pools,
    trackers,
    chainId,
  });
