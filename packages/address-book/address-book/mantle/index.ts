import { beefyfinance } from './platforms/beefyfinance';
import { moe } from './platforms/moe';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _mantle = {
  platforms: {
    beefyfinance,
    moe,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const;

export const mantle: ConstInterface<typeof _mantle, Chain> = _mantle;
