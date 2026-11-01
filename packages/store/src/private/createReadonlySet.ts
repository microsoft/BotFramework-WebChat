function throwReadonly(): never {
  throw new TypeError('Cannot modify a readonly Set');
}

/**
 * An immutable `Set` which wraps a private `Set`.
 *
 * It does not extend `Set`: a subclass of `Set` has the internal slots of a `Set`, which `Set.prototype.add.call()`
 * could modify. Instead, the prototype is chained to `Set.prototype` so `instanceof Set` is `true`, and all read
 * methods are delegated to the private `Set`.
 *
 * Compared to a `Proxy`, method calls are plain property lookups without traps or bound functions.
 */
class ReadonlySetImpl<T> implements ReadonlySet<T> {
  constructor(iterable: Iterable<T>) {
    // Copy into a private `Set` so changes to the original iterable will not leak in.
    this.#set = new Set<T>(iterable);

    Object.freeze(this);
  }

  readonly #set: Set<T>;

  static isReadonlySet(value: unknown): value is ReadonlySet<unknown> {
    return !!value && typeof value === 'object' && #set in value;
  }

  get size(): number {
    return this.#set.size;
  }

  difference<U>(other: ReadonlySetLike<U>): Set<T> {
    return this.#set.difference(other);
  }

  entries(): SetIterator<[T, T]> {
    return this.#set.entries();
  }

  forEach(callbackfn: (value: T, value2: T, set: ReadonlySet<T>) => void, thisArg?: unknown): void {
    this.#set.forEach(value => callbackfn.call(thisArg, value, value, this));
  }

  has(value: T): boolean {
    return this.#set.has(value);
  }

  intersection<U>(other: ReadonlySetLike<U>): Set<T & U> {
    return this.#set.intersection(other);
  }

  isDisjointFrom(other: ReadonlySetLike<unknown>): boolean {
    return this.#set.isDisjointFrom(other);
  }

  isSubsetOf(other: ReadonlySetLike<unknown>): boolean {
    return this.#set.isSubsetOf(other);
  }

  isSupersetOf(other: ReadonlySetLike<unknown>): boolean {
    return this.#set.isSupersetOf(other);
  }

  keys(): SetIterator<T> {
    return this.#set.keys();
  }

  symmetricDifference<U>(other: ReadonlySetLike<U>): Set<T | U> {
    return this.#set.symmetricDifference(other);
  }

  union<U>(other: ReadonlySetLike<U>): Set<T | U> {
    return this.#set.union(other);
  }

  values(): SetIterator<T> {
    return this.#set.values();
  }

  [Symbol.iterator](): SetIterator<T> {
    return this.#set[Symbol.iterator]();
  }
}

// `instanceof Set` should be `true`.
Object.setPrototypeOf(ReadonlySetImpl.prototype, Set.prototype);

Object.defineProperties(ReadonlySetImpl.prototype, {
  // Mutating methods on `Set.prototype` would throw "incompatible receiver", override them with a clearer error.
  add: { value: throwReadonly },
  clear: { value: throwReadonly },
  delete: { value: throwReadonly },
  // Some libraries compare `constructor` for equality, e.g. `expect().toEqual()`.
  constructor: { value: Set },
  [Symbol.toStringTag]: { value: 'Set' }
});

Object.freeze(ReadonlySetImpl.prototype);
Object.freeze(ReadonlySetImpl);

/**
 * Checks if the value is a readonly `Set` created by `createReadonlySet()`.
 */
function isReadonlySet(value: unknown): value is ReadonlySet<unknown> {
  return ReadonlySetImpl.isReadonlySet(value);
}

/**
 * Creates an immutable `Set` which cannot be modified.
 *
 * - `instanceof Set` is `true`
 * - `add()`, `clear()`, and `delete()` will throw
 * - `Set.prototype.add.call()` will throw as it does not have the internal slots of a `Set`
 * - Changing properties or prototype will fail
 * - `Object.isFrozen()` is `true`
 *
 * Note: items are not frozen, freeze them before passing in if needed.
 */
function createReadonlySet<T>(iterable: Iterable<T>): ReadonlySet<T> {
  return new ReadonlySetImpl(iterable);
}

export default createReadonlySet;
export { isReadonlySet };
