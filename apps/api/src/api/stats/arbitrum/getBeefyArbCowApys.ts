import { getCowApys } from '../common/getCowVaultApys.js';

export const getBeefyArbCowApys = async () => {
  return await getCowApys('arbitrum');
};
