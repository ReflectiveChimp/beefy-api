import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.js';

export const getBeefyCowZkSyncPrices = async (tokenPrices: Record<string, number>) => {
  return await getBeefyCowcentratedVaultPrices('zksync', tokenPrices);
};
