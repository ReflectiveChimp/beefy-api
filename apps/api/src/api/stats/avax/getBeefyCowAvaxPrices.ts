import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.js';

export const getBeefyCowAvaxPrices = async (tokenPrices: Record<string, number>) => {
  return await getBeefyCowcentratedVaultPrices('avax', tokenPrices);
};
