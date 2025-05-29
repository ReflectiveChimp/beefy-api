import { addressBook } from 'blockchain-addressbook';
import { ZERO_ADDRESS } from '../../utils/address.js';
import type { ApiChain } from '../../utils/chain.js';
import type { ProviderId } from './swap/providers/index.js';

export type ZapFee = {
  value: number;
  receiver?: string;
};

const DEFAULT_ZAP_FEE = 0.0005;

export const getZapProviderFee = (provider: ProviderId, chain: ApiChain): ZapFee => {
  if (provider === 'odos') {
    // It's static to the odos code config, we can't make it dynamic
    return {
      value: DEFAULT_ZAP_FEE,
    };
  }

  const beefyPlatform = addressBook[chain].platforms.beefyfinance;
  if (!beefyPlatform) {
    throw new Error(`No Beefy Platform found for chain ${chain}`);
  }

  const receiver = [
    beefyPlatform.treasurySwapper,
    beefyPlatform.treasuryMultisig,
    beefyPlatform.treasury,
  ].find((a): a is string => !!a && a !== ZERO_ADDRESS);

  if (!receiver) {
    throw new Error(
      `No fee receiver (treasurySwapper, or treasuryMultisig, or treasury) found for ${provider} on ${chain}`,
    );
  }

  return {
    value: DEFAULT_ZAP_FEE,
    receiver: receiver,
  };
};
