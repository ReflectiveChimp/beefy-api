import { getCowApys } from '../common/getCowVaultApys.js';

export const getBeefyCowMantleApys = async () => {
  return await getCowApys('mantle');
};
