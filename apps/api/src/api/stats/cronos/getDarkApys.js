import { vvsClient } from '../../../apollo/client.js';
import { CRONOS_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/cronos/darkCryptoLpPools.json';
import { getMasterChefApys } from '../common/getMasterChefApys.js';

const getDarkCryptoApys = async () =>
  await getMasterChefApys({
    chainId: chainId,
    masterchef: '0x42B652A523367e7407Fb4BF2fA1F430781e7db8C',
    tokenPerBlock: 'rewardPerSecond',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'SKY',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: vvsClient,
    liquidityProviderFee: 0.003,
    // log: true,
  });

export default getDarkCryptoApys;
