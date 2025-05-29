import { ONE_CHAIN_ID } from '../../../constants.js';

import { sushiOneClient } from '../../../apollo/client.js';
import { getMiniChefApys } from '../common/getMiniChefApys.js';

import { addressBook } from 'blockchain-addressbook';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2.js';
import pools from '../../../data/one/sushiLpPools.json';

const {
  one: {
    platforms: {
      sushi: { minichef, complexRewarderTime },
    },
    tokens: { oneSUSHI, WONE },
  },
} = addressBook;

export const getSushiLpApys = () => {
  return getMiniChefApys({
    minichefConfig: {
      minichef,
      minichefAbi: SushiMiniChefV2,
      outputOracleId: oneSUSHI.oracleId,
      tokenPerSecondContractMethodName: 'sushiPerSecond',
    },
    rewarderConfig: {
      rewarder: complexRewarderTime,
      rewarderTokenOracleId: WONE.oracleId,
      rewarderTotalAllocPoint: 9600,
    },
    pools,
    tradingClient: sushiOneClient,
    chainId: ONE_CHAIN_ID,
  });
};
