import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.js';

export const getBeefyCowScrollPrices = async (tokenPrices: Record<string, number>) => {
  return await getBeefyCowcentratedVaultPrices('scroll', tokenPrices);
};
