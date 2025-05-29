import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.js';

export const getBeefyCowBasePrices = async (tokenPrices: Record<string, number>) => {
  return await getBeefyCowcentratedVaultPrices('base', tokenPrices);
};
