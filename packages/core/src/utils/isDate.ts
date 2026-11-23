/** True if the value is a `Date`, from this realm or another (unlike `instanceof`). Reads no clock. */
// The type only: the clock is not read.
// eslint-disable-next-line no-restricted-globals
export default function isDate(value: unknown): value is Date {
  return Object.prototype.toString.call(value) === '[object Date]';
}
