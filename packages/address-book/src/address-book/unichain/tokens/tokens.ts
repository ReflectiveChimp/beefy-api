import type { Token } from '../../../types/token.js';
import { constTokens } from '../../../util/constTokens.js';

const ETH = {
  name: 'Wrapped Ether',
  address: '0x4200000000000000000000000000000000000006',
  symbol: 'WETH',
  oracleId: 'WETH',
  decimals: 18,
  chainId: 130,
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  bridge: 'canonical',
  logoURI: '',
  documentation: 'https://ethereum.org/en/developers/docs/',
} as const satisfies Token;

export const tokens = constTokens({
  WNATIVE: ETH,
  FEES: ETH,
  ETH,
  WETH: ETH,
});
