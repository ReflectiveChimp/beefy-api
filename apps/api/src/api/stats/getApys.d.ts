import type { ApyBreakdown } from './common/getApyBreakdown.js';

export function getApys(): {
  apys: Record<string, number>;
  apyBreakdowns: Record<string, ApyBreakdown>;
};

export function getBoostAprs(): Record<string, number>;

export function initApyService(): Promise<void>;
