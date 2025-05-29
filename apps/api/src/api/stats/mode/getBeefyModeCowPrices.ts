import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.js';

export const getBeefyCowModePrices = async (tokenPrices: Record<string, number>) => {
  return await getBeefyCowcentratedVaultPrices('mode', tokenPrices);
};
