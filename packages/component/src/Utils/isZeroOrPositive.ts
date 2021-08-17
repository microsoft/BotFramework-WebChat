/**
 * Returns `true`, if the number is zero or positive, otherwise, `false`, including minus zeroes.
 */
export default function isZeroOrPositive(value: number): boolean {
  // This will handle minus-zero.
  return 1 / value >= 0;
}
