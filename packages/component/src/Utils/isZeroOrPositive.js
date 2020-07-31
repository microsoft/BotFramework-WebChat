export default function isZeroOrPositive(value) {
  // This will handle minus-zero.
  return 1 / value >= 0;
}
