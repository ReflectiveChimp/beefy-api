import type { ISwapProvider } from './ISwapProvider.js';
import { KyberSwapProvider } from './KyberSwapProvider.js';
import { OdosSwapProvider } from './OdosSwapProvider.js';
import { OneInchSwapProvider } from './OneInchSwapProvider.js';

export const providersById = {
  'one-inch': new OneInchSwapProvider(),
  kyber: new KyberSwapProvider(),
  odos: new OdosSwapProvider(),
} as const satisfies Record<string, ISwapProvider>;

export type ProviderId = keyof typeof providersById;

export const providers = Object.entries(providersById).map(([id, provider]) => ({
  id: id as ProviderId,
  instance: provider,
}));
