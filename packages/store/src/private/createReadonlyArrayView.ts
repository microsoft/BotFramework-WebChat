const INDEX_PATTERN = /^(?:0|[1-9]\d*)$/u;

function toIndex(key: string | symbol, length: number): number | undefined {
  if (typeof key === 'string' && INDEX_PATTERN.test(key)) {
    const index = +key;

    return index < length ? index : undefined;
  }

  return undefined;
}

function throwReadonly(): never {
  throw new TypeError('Array is read-only');
}

/**
 * Creates a read-only array which items are resolved on-the-fly. This is O(1) regardless of the length.
 *
 * - `Array.isArray()` returns `true`, all non-mutating `Array.prototype` methods, spread, and `JSON.stringify()` work
 * - Mutations (e.g. assigning items, `push()`, `sort()`) throw `TypeError`
 * - Items are not cached, `getItem` is called on every access and must return the same value for the same index
 */
function createReadonlyArrayView<T>(length: number, getItem: (index: number) => T): readonly T[] {
  // The target is not frozen, otherwise, the proxy must return the `length` of the target, which is 0.
  return new Proxy<T[]>([], {
    defineProperty: throwReadonly,
    deleteProperty: throwReadonly,
    get(target, key, receiver) {
      if (key === 'length') {
        return length;
      }

      const index = toIndex(key, length);

      return typeof index === 'number' ? getItem(index) : Reflect.get(target, key, receiver);
    },
    getOwnPropertyDescriptor(target, key) {
      if (key === 'length') {
        // `length` of the target is non-configurable, it must be reported as non-configurable.
        return { configurable: false, enumerable: false, value: length, writable: true };
      }

      const index = toIndex(key, length);

      return typeof index === 'number'
        ? { configurable: true, enumerable: true, value: getItem(index), writable: false }
        : Reflect.getOwnPropertyDescriptor(target, key);
    },
    has(target, key) {
      return key === 'length' || typeof toIndex(key, length) === 'number' || Reflect.has(target, key);
    },
    ownKeys: () => [...Array.from({ length }, (_, index) => `${index}`), 'length'],
    preventExtensions: throwReadonly,
    set: throwReadonly,
    setPrototypeOf: throwReadonly
  });
}

export default createReadonlyArrayView;
