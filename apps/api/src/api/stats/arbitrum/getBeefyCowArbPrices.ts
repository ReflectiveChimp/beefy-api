import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.js';

export const getBeefyCowArbPrices = async (tokenPrices: Record<string, number>) => {
  return await getBeefyCowcentratedVaultPrices('arbitrum', tokenPrices);
};
