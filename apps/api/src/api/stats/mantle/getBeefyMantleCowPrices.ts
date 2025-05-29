import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.js';

export const getBeefyCowMantlePrices = async (tokenPrices: Record<string, number>) => {
  return await getBeefyCowcentratedVaultPrices('mantle', tokenPrices);
};
