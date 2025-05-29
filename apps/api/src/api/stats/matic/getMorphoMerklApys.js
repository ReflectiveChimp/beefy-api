import { POLYGON_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/matic/morphoPools.json';
import getApyBreakdown from '../common/getApyBreakdown.js';
import { getMerklApys } from '../common/getMerklApys.js';

const getMorphoMerklApys = async () => {
  const morphoMerklPools = pools.filter((pool) => pool.merkl);
  const merklApys = await getMerklApys(chainId, morphoMerklPools);
  return getApyBreakdown(morphoMerklPools, 0, merklApys, 0);
};

export { getMorphoMerklApys };
