import { getCowApys } from '../common/getCowVaultApys.js';

export const getBeefyCowRootstockApys = async () => {
  return await getCowApys('rootstock');
};
