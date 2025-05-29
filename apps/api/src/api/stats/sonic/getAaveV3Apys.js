import { SONIC_CHAIN_ID } from '../../../constants.js';
import pools from '../../../data/sonic/aaveV3Pools.json';
import { getAaveV3ApyData } from '../common/aave/getAaveV3Apys.js';

const config = {
  dataProvider: '0x306c124fFba5f2Bc0BcAf40D249cf19D492440b9',
  incentives: '0x24bD6e9ca54F1737467DEf82dCA9702925B3Aa59',
  rewards: [],
};

export const getAaveV3Apys = async () => {
  return getAaveV3ApyData(config, pools, SONIC_CHAIN_ID);
};
