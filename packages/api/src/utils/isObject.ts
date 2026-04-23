const { toString } = {};

export default function isObject(obj: unknown): boolean {
  return toString.call(obj) === '[object Object]';
}
