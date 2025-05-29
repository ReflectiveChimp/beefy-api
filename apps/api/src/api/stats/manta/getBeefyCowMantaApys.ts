import { getCowApys } from '../common/getCowVaultApys.js';

export const getBeefyCowMantaApys = async () => {
  return await getCowApys('manta');
};
