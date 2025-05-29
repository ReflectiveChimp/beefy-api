import { getCowApys } from '../common/getCowVaultApys.js';

export const getBeefyOPCowApys = async () => {
  return await getCowApys('optimism');
};
