export default function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}
