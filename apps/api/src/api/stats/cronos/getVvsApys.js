import { vvsClient } from '../../../apollo/client.js';
import { CRONOS_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/cronos/vvsLpPools.json';
import { getMasterChefApys } from '../common/getMasterChefApys.js';

const getVvsApys = async () =>
  await getMasterChefApys({
    chainId: chainId,
    masterchef: '0xDccd6455AE04b03d785F12196B492b18129564bc',
    tokenPerBlock: 'vvsPerBlock',
    hasMultiplier: false,
    pools: pools,
    singlePools: [
      {
        name: 'vvs-vvs',
        poolId: 0,
        address: '0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03',
        oracle: 'tokens',
        oracleId: 'VVS',
        decimals: '1e18',
      },
    ],
    oracleId: 'VVS',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: vvsClient,
    liquidityProviderFee: 0.003,
    // log: true,
  });

export default getVvsApys;
