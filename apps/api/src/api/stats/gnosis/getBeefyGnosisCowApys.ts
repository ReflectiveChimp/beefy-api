import { getCowApys } from '../common/getCowVaultApys.js';

export const getBeefyGnosisCowApys = async () => {
  return await getCowApys('gnosis');
};
