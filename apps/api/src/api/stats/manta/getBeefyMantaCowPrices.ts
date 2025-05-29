import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.js';

export const getBeefyCowMantaPrices = async (tokenPrices: Record<string, number>) => {
  return await getBeefyCowcentratedVaultPrices('manta', tokenPrices);
};
