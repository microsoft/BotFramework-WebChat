const OBJECT_PROTOTYPE = Object.prototype;

export default function isPlainObject(obj: unknown): boolean {
  return Object.getPrototypeOf(obj) === OBJECT_PROTOTYPE;
}
