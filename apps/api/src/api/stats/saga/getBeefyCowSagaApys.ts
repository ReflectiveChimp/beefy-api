import { getCowApys } from '../common/getCowVaultApys.js';

export const getBeefyCowSagaApys = async () => {
  return await getCowApys('saga');
};
