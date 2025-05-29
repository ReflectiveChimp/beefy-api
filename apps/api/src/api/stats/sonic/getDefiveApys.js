import { defiveClient } from '../../../apollo/client.js';
import { SONIC_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/sonic/defiveLpPools.json';
import { getMasterChefApys } from '../common/getMasterChefApys.js';

const getDefiveApys = async () =>
  await getMasterChefApys({
    chainId: chainId,
    masterchef: '0x4aDe5608127594CD9eA131f0826AEA02FE517461',
    tokenPerBlock: 'emission',
    pools: pools,
    oracleId: 'FIVE',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: defiveClient,
    liquidityProviderFee: 0.0014,
    // log: true,
  });

export default getDefiveApys;
