import { wigoClient } from '../../../apollo/client.js';
import { FANTOM_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/fantom/wigoLpPools.json';
import { getMasterChefApys } from '../common/getMasterChefApys.js';

const getWigoApys = async () =>
  await getMasterChefApys({
    chainId: chainId,
    masterchef: '0xA1a938855735C0651A6CfE2E93a32A28A236d0E9',
    tokenPerBlock: 'wigoPerSecond',
    hasMultiplier: true,
    useMultiplierTimestamp: true,
    pools: pools,
    singlePools: [
      {
        name: 'wigo-wigo',
        poolId: 0,
        address: '0xE992bEAb6659BFF447893641A378FbbF031C5bD6',
        oracle: 'tokens',
        oracleId: 'WIGO',
        decimals: '1e18',
      },
    ],
    oracleId: 'WIGO',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: wigoClient,
    liquidityProviderFee: 0.0018,
    // log: true,
  });

export default getWigoApys;
