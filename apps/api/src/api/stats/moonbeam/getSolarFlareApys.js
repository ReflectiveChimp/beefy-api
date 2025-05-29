import { MOONBEAM_CHAIN_ID as chainId } from '../../../constants.js';
import { getMultiRewardMasterChefApys } from '../common/getMultiRewardMasterChefApys.js';

import { solarflareClient } from '../../../apollo/client.js';
import { SOLAR_LPF } from '../../../constants.js';
import pools from '../../../data/moonbeam/solarFlareLpPools.json';

const getSolarFlareApys = async () =>
  await getMultiRewardMasterChefApys({
    chainId: chainId,
    masterchef: '0x995da7dfB96B4dd1e2bd954bE384A1e66cBB4b8c',
    secondsPerBlock: 1,
    pools: pools,
    oracleId: 'FLARE',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: solarflareClient,
    liquidityProviderFee: SOLAR_LPF,
    // log: true,
  });

export { getSolarFlareApys };
