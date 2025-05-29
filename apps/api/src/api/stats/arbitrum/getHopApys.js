import { addressBook } from 'blockchain-addressbook';
import { getEDecimals } from '../../../utils/getEDecimals.js';
import { getHopCommonApys } from '../common/hop/getHopCommonApys.js';

import { hopArbClient } from '../../../apollo/client.js';
import { HOP_LPF } from '../../../constants.js';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants.js';
import hopPools from '../../../data/arbitrum/hopPools.json';
import rplPools from '../../../data/arbitrum/hopRplPools.json';

const {
  arbitrum: {
    tokens: { HOP, RPL },
  },
} = addressBook;

export const getHopApys = async () => {
  const [apysHop, apysRpl] = await Promise.all([
    getHopCommonApys({
      pools: hopPools,
      oracleId: 'HOP',
      oracle: 'tokens',
      tokenAddress: HOP.address,
      decimals: getEDecimals(HOP.decimals),
      chainId,
      isRewardInXToken: false,
      client: hopArbClient,
      liquidityProviderFee: HOP_LPF,
      // log: true,
    }),
    getHopCommonApys({
      pools: rplPools,
      oracleId: 'RPL',
      oracle: 'tokens',
      tokenAddress: RPL.address,
      decimals: getEDecimals(RPL.decimals),
      chainId,
      isRewardInXToken: false,
      client: hopArbClient,
      liquidityProviderFee: HOP_LPF,
      // log: true,
    }),
  ]);

  const apys = { ...apysHop.apys, ...apysRpl.apys };
  const apyBreakdowns = {
    ...apysHop.apyBreakdowns,
    ...apysRpl.apyBreakdowns,
  };

  return { apys: apys, apyBreakdowns: apyBreakdowns };
};
