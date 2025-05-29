import { addressBook } from 'blockchain-addressbook';
import type { BeefyFinance } from 'blockchain-addressbook/types/beefyfinance';
import { omitBy } from 'lodash';
import { ZERO_ADDRESS } from '../../utils/address.js';

const configsByChain: Record<string, BeefyFinance> = {};

export const initConfigService = () => {
  Object.keys(addressBook).forEach((chain) => {
    const config = addressBook[chain].platforms.beefyfinance;
    // Prune ab fields
    configsByChain[chain] = omitBy(
      config,
      (value) => value === undefined || value === null || value === ZERO_ADDRESS,
    );
  });

  console.log('> Configs initialized');
};

export const getAllConfigs = () => {
  return configsByChain;
};

export const getSingleChainConfig = (chain: string) => {
  return configsByChain[chain] ?? {};
};
