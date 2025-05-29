import { AVAX_CHAIN_ID } from '../../../constants.js';
import pools from '../../../data/avax/aaveV3Pools.json';
import { getAaveV3ApyData } from '../common/aave/getAaveV3Apys.js';

const config = {
  dataProvider: '0x7F23D86Ee20D869112572136221e173428DD740B',
  incentives: '0x929EC64c34a17401F460460D4B9390518E5B473e',
  rewards: [
    {
      token: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
      oracle: 'tokens',
      oracleId: 'AVAX',
      decimals: '1e18',
    },
  ],
};

const getAaveV3Apys = async () => {
  return getAaveV3ApyData(config, pools, AVAX_CHAIN_ID);
};

export { getAaveV3Apys };
