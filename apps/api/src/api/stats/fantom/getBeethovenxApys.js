import BeethovenxChef from '../../../abis/fantom/BeethovenxChef.jsx';
import { beetClient } from '../../../apollo/client.js';
import pools from '../../../data/fantom/beethovenxPools.json';
import { getMasterChefApys } from '../common/getMasterChefApys.js';

const getBeethovenxApys = async () =>
  await getMasterChefApys({
    chainId: 250,
    masterchef: '0x8166994d9ebBe5829EC86Bd81258149B87faCfd3',
    masterchefAbi: BeethovenxChef,
    tokenPerBlock: 'beetsPerBlock',
    hasMultiplier: false,
    allocPointIndex: '0',
    pools: pools,
    oracleId: 'BEETS',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: beetClient,
    liquidityProviderFee: 0.0025,
    burn: 0.128,
    // log: true,
  });

export default getBeethovenxApys;
