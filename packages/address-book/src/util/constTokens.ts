import type { Token } from '../types/token.js';

export function constTokens<T extends Record<string, Token>>(tokens: T): Record<keyof T, Token> {
  return tokens;
}
