import { addressBook } from 'blockchain-addressbook';
import { getEDecimals } from '../../../utils/getEDecimals.js';
import { getHopCommonApys } from '../common/hop/getHopCommonApys.js';

import { hopOpClient } from '../../../apollo/client.js';
import { HOP_LPF } from '../../../constants.js';
import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/optimism/hopOpPools.json';
const {
  optimism: {
    tokens: { OP },
  },
} = addressBook;

export const getHopOpApys = async () => {
  return await getHopCommonApys({
    pools,
    oracleId: 'OP',
    oracle: 'tokens',
    tokenAddress: OP.address,
    decimals: getEDecimals(OP.decimals),
    chainId,
    isRewardInXToken: false,
    client: hopOpClient,
    liquidityProviderFee: HOP_LPF,
    // log: true,
  });
};
