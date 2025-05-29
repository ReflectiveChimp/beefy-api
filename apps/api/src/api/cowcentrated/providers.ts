import { arbitrum } from 'blockchain-addressbook/arbitrum';
import { avax } from 'blockchain-addressbook/avax';
import { base } from 'blockchain-addressbook/base';
import { bsc } from 'blockchain-addressbook/bsc';
import { linea } from 'blockchain-addressbook/linea';
import { lisk } from 'blockchain-addressbook/lisk';
import { mode } from 'blockchain-addressbook/mode';
import { optimism } from 'blockchain-addressbook/optimism';
import { scroll } from 'blockchain-addressbook/scroll';
import { sonic } from 'blockchain-addressbook/sonic';
import type { AnyCowClm, CowProvider } from './types.js';

export const providers = {
  ramses: {
    poolTradingRewardTokens: {
      arbitrum: [arbitrum.tokens.RAM, arbitrum.tokens.ARB],
    },
  },
  pancakeswap: {
    poolTradingRewardTokens: {
      arbitrum: [arbitrum.tokens.CAKE],
      bsc: [bsc.tokens.CAKE],
    },
  },
  velodrome: {
    poolTradingRewardTokens: {
      optimism: [optimism.tokens.VELOV2],
      mode: [mode.tokens.XVELO],
      lisk: [lisk.tokens.XVELO],
    },
  },
  aerodrome: {
    poolTradingRewardTokens: {
      base: [base.tokens.AERO],
    },
  },
  nile: {
    poolTradingRewardTokens: {
      linea: [linea.tokens.NILE],
    },
  },
  pharaoh: {
    poolTradingRewardTokens: {
      avax: [avax.tokens.PHAR, avax.tokens.sAVAX, avax.tokens.ggAVAX],
    },
  },
  nuri: {
    poolTradingRewardTokens: {
      scroll: [scroll.tokens.NURI],
    },
  },
  shadow: {
    poolTradingRewardTokens: {
      sonic: [sonic.tokens.SHADOW, sonic.tokens.GEMS],
    },
  },
} as const satisfies Record<string, CowProvider>;

export function getCowProvider(providerId: string | undefined): CowProvider | undefined {
  return providerId ? providers[providerId] : undefined;
}

export function getCowProviderForClm(clm: AnyCowClm): CowProvider | undefined {
  return getCowProvider(clm.providerId);
}
