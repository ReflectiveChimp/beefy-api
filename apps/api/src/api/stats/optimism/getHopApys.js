import { addressBook } from 'blockchain-addressbook';
import { getEDecimals } from '../../../utils/getEDecimals.js';
import { getHopCommonApys } from '../common/hop/getHopCommonApys.js';

import { hopOpClient } from '../../../apollo/client.js';
import { HOP_LPF } from '../../../constants.js';
import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/optimism/hopPools.json';
const {
  optimism: {
    tokens: { HOP },
  },
} = addressBook;

export const getHopApys = async () => {
  return await getHopCommonApys({
    pools,
    oracleId: 'HOP',
    oracle: 'tokens',
    tokenAddress: HOP.address,
    decimals: getEDecimals(HOP.decimals),
    chainId,
    isRewardInXToken: false,
    client: hopOpClient,
    liquidityProviderFee: HOP_LPF,
    // log: true,
  });
};
