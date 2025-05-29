import { KAVA_CHAIN_ID } from '../../../constants.js';

import { sushiKavaClient } from '../../../apollo/client.js';
import { getMiniChefApys } from '../common/getMiniChefApys.js';

import { addressBook } from 'blockchain-addressbook';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2.js';
import pools from '../../../data/kava/sushiKavaLpPools.json';

const {
  kava: {
    platforms: {
      sushiKava: { minichef, complexRewarderTime },
    },
    tokens: { SUSHI, KAVA },
  },
} = addressBook;

export const getSushiLpApys = () => {
  return getMiniChefApys({
    minichefConfig: {
      minichef,
      minichefAbi: SushiMiniChefV2 as any,
      outputOracleId: SUSHI.oracleId,
      tokenPerSecondContractMethodName: 'sushiPerSecond',
    },
    rewarderConfig: {
      rewarder: complexRewarderTime,
      rewarderTokenOracleId: KAVA.oracleId,
      rewarderTotalAllocPoint: 1000,
    },
    pools,
    tradingClient: sushiKavaClient,
    chainId: KAVA_CHAIN_ID,
    // log: true,
  });
};
