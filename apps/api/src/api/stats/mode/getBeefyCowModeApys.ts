import { getCowApys } from '../common/getCowVaultApys.js';

export const getBeefyCowModeApys = async () => {
  return await getCowApys('mode');
};
