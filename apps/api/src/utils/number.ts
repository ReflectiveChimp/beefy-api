import { isBigNumberish, isFiniteBigNumber, toBigNumber } from './big-number.js';

export function isNumber(value: any): value is number {
  return typeof value === 'number';
}

export function isFiniteNumber(value: any): value is number {
  return value !== null && isNumber(value) && !isNaN(value) && isFinite(value);
}

export function median(values: number[]): number {
  if (values.length === 0) {
    throw new Error(`No values provided to calculate median`);
  }
  if (values.length === 1) return values[0]!;

  const sorted = values.sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    // Average of two middle values when length is even
    return (sorted[middle - 1]! + sorted[middle]!) / 2;
  }

  return sorted[middle]!;
}

/**
 * If finite number or BigNumber is provided, return as number, otherwise return the default value.
 * Disallows Infinity and NaN
 */
export function toFiniteNumber(value: any, defaultValue?: number): number | undefined {
  if (isFiniteNumber(value)) {
    return value;
  }
  if (isBigNumberish(value)) {
    const bn = toBigNumber(value);
    return isFiniteBigNumber(bn) ? bn.toNumber() : defaultValue;
  }
  return defaultValue;
}

/**
 * If number or BigNumber is provided, return as number, otherwise return the default value.
 * Allows Infinity, Disallows NaN
 */
export function toNumber(value: any, defaultValue: number): number;
export function toNumber(value: any, defaultValue?: number): number | undefined;
export function toNumber(value: any, defaultValue?: number): number | undefined {
  if (isNumber(value)) {
    return isNaN(value) ? defaultValue : value;
  }
  if (isBigNumberish(value)) {
    const bn = toBigNumber(value);
    return bn.isNaN() ? defaultValue : bn.toNumber();
  }
  return defaultValue;
}
