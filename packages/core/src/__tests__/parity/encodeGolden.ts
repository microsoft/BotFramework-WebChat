/* eslint-disable no-restricted-globals */
// Encodes what a parity script recorded as plain JSON, for the golden files: compared with `toStrictEqual`, the encoded
// value of a run equals the parsed golden only if the records are the same. JSON has no `undefined` (a key set to
// `undefined` is not a missing key), no functions and no class instances, so these become marker strings and objects.

/**
 * Encodes `value` as plain JSON. `labels` names objects by identity (e.g. the Direct Line given to `connect()`) instead
 * of their content.
 */
export default function encodeGolden(value: unknown, labels?: WeakMap<object, string> | undefined): unknown {
  const ancestors = new Set<object>();

  // eslint-disable-next-line complexity
  function walk(item: unknown): unknown {
    if (typeof item === 'undefined') {
      return '[undefined]';
    } else if (typeof item === 'number') {
      return Number.isFinite(item) ? (Object.is(item, -0) ? '[-0]' : item) : `[${item}]`;
    } else if (typeof item === 'function') {
      return '[function]';
    } else if (typeof item === 'symbol' || typeof item === 'bigint') {
      return `[${typeof item} ${String(item)}]`;
    } else if (!item || typeof item !== 'object') {
      return item;
    } else if (labels?.has(item)) {
      return labels.get(item);
    } else if (ancestors.has(item)) {
      throw new Error('encodeGolden: circular reference');
    }

    const entries = (object: object) =>
      Object.fromEntries(Object.entries(object).map(([key, child]) => [key, walk(child)]));
    const prototype = Object.getPrototypeOf(item);

    ancestors.add(item);

    try {
      if (Array.isArray(item)) {
        return Array.from(item, child => walk(child));
      } else if (prototype === Object.prototype || prototype === null) {
        return entries(item);
      }

      // A class instance: a marker object with its constructor name, and its content.
      if (item instanceof Error) {
        return { [`[${item.name}]`]: item.message };
      } else if (item instanceof Date) {
        return { '[Date]': Number.isNaN(item.getTime()) ? 'Invalid Date' : item.toISOString() };
      } else if (item instanceof Map) {
        return { '[Map]': Array.from(item, ([key, child]) => [walk(key), walk(child)]) };
      } else if (item instanceof Set) {
        return { '[Set]': Array.from(item, child => walk(child)) };
      } else if (typeof File !== 'undefined' && item instanceof File) {
        // Not `lastModified`: the time the file was created, different on every run.
        return { '[File]': { name: item.name, size: item.size, type: item.type } };
      } else if (typeof Blob !== 'undefined' && item instanceof Blob) {
        return { '[Blob]': { size: item.size, type: item.type } };
      } else if (item instanceof URL) {
        return { '[URL]': item.href };
      }

      return { [`[${prototype?.constructor?.name || 'Object'}]`]: entries(item) };
    } finally {
      ancestors.delete(item);
    }
  }

  return walk(value);
}
