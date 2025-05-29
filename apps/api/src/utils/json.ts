export function infinityToStringReplacer(_: string, value: unknown): unknown {
  if (value === Number.POSITIVE_INFINITY) {
    return 'Infinity';
  }
  if (value === Number.NEGATIVE_INFINITY) {
    return '-Infinity';
  }
  return value;
}
