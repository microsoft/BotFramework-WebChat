export default function isPlainObject(obj: unknown): boolean {
  return Object.getPrototypeOf(obj) === Object;
}
