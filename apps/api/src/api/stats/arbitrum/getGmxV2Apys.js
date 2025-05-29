import { gmxArbClient } from '../../../apollo/client.js';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/arbitrum/gmxV2Pools.json';
import { getGmxV2CommonApys } from '../common/gmx/getGmxV2Apys.js';

export const getGmxV2Apys = async () =>
  await getGmxV2CommonApys({
    pools: pools,
    tradingFeeInfoClient: gmxArbClient,
    chainId: chainId,
    url: 'https://arbitrum-api.gmxinfra2.io/incentives/stip?',
    rewardId: 'ARB',
  });
