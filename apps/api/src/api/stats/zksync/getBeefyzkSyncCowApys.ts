import { getCowApys } from '../common/getCowVaultApys.js';

export const getBeefyzkSyncCowApys = async () => {
  return await getCowApys('zksync');
};
