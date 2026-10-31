const MUTATING_METHOD_NAMES: ReadonlySet<PropertyKey> = Object.freeze(new Set<PropertyKey>(['add', 'clear', 'delete']));

const readonlySets = new WeakSet<object>();

function throwReadonly(): never {
  throw new TypeError('Cannot modify a readonly Set');
}

/**
 * Checks if the value is a readonly `Set` created by `createReadonlySet()`.
 */
function isReadonlySet(value: unknown): value is ReadonlySet<unknown> {
  return !!value && typeof value === 'object' && readonlySets.has(value);
}

/**
 * Creates an immutable `Set` which cannot be modified.
 *
 * - `instanceof Set` is `true`
 * - `add()`, `clear()`, and `delete()` will throw
 * - `Set.prototype.add.call()` will throw as the proxy does not have the internal slots of a `Set`
 * - Changing properties or prototype will throw
 * - `Object.isFrozen()` is `true`
 *
 * Note: items are not frozen, freeze them before passing in if needed.
 */
function createReadonlySet<T>(iterable: Iterable<T>): ReadonlySet<T> {
  // Copy into a private `Set` so changes to the original iterable will not leak in.
  // Freezing the target will make `Object.isFrozen()` returns `true` for the proxy.
  const target = Object.freeze(new Set<T>(iterable));
  const boundMethods = new Map<PropertyKey, unknown>();

  const readonlySet = new Proxy(target, {
    defineProperty: () => throwReadonly(),
    deleteProperty: () => throwReadonly(),
    get(target, key) {
      if (MUTATING_METHOD_NAMES.has(key)) {
        return throwReadonly;
      }

      // Use `target` as receiver, otherwise, getters such as `size` will throw "incompatible receiver".
      const value: unknown = Reflect.get(target, key, target);

      // Methods such as `has()` and `[Symbol.iterator]()` requires `this` to be the actual `Set`.
      // `constructor` should be kept as-is, it is used for equality check by some libraries.
      if (typeof value !== 'function' || key === 'constructor') {
        return value;
      }

      // Cache the bound method so `set.has === set.has`.
      boundMethods.has(key) || boundMethods.set(key, value.bind(target));

      return boundMethods.get(key);
    },
    set: () => throwReadonly(),
    setPrototypeOf: () => throwReadonly()
  });

  readonlySets.add(readonlySet);

  return readonlySet;
}

export default createReadonlySet;
export { isReadonlySet };
