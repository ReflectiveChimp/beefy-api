import { stellaswap } from 'blockchain-addressbook/moonbeam/platforms';
import { stellaClient } from '../../../apollo/client.js';
import { MOONBEAM_CHAIN_ID as chainId } from '../../../constants.js';
import { getMultiRewardMasterChefApys } from '../common/getMultiRewardMasterChefApys.js';

import poolsV2 from '../../../data/moonbeam/stellaswapLpV2Pools.json';

const getStellaswapApys = async () =>
  await getMultiRewardMasterChefApys({
    chainId: chainId,
    masterchef: stellaswap.masterchefV1distributorV2,
    tokenPerBlock: 'stellaPerSec',
    hasMultiplier: false,
    secondsPerBlock: 1, // because tokenPerBlock is expressed in seconds
    pools: [...poolsV2],
    oracleId: 'STELLA',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: stellaClient,
    liquidityProviderFee: 0.0025,
    // log: true,
  });

export { getStellaswapApys };
