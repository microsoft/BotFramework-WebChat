/**
 * Iterates the keys of a set-like object.
 *
 * Unlike `for...of`, it does not require the iterator returned by `keys()` to be iterable, as `Set` methods do.
 */
function* iterateSetLike<T>(setLike: ReadonlySetLike<T>): Generator<T, void, unknown> {
  const iterator = setLike.keys();

  for (;;) {
    const result = iterator.next();

    if (result.done) {
      return;
    }

    yield result.value;
  }
}

/**
 * Validates a set-like object as `Set` methods do, i.e. `size` is a non-negative number, `has()` and `keys()` are
 * functions.
 *
 * @see {@link https://tc39.es/ecma262/#sec-getsetrecord ECMAScript: GetSetRecord}
 */
function validateSetLike<T>(setLike: ReadonlySetLike<T>): ReadonlySetLike<T> {
  if (
    !setLike ||
    typeof setLike !== 'object' ||
    Number.isNaN(Number(setLike.size)) ||
    typeof setLike.has !== 'function' ||
    typeof setLike.keys !== 'function'
  ) {
    throw new TypeError('The argument must be a set-like object');
  } else if (Math.trunc(Number(setLike.size)) < 0) {
    // As `ToIntegerOrInfinity()`, `-0.5` is truncated to `0`.
    throw new RangeError('The size of the set-like object must not be negative');
  }

  return setLike;
}

/**
 * Checks if a set has a value of any type, as values from the other set could be of a different type.
 */
function hasValue(set: ReadonlySet<unknown>, value: unknown): boolean {
  return set.has(value);
}

/**
 * Implements read methods of a `Set` based on `has()`, `size`, and `keys()`.
 *
 * Set methods (e.g. `union()`) are implemented without native `Set.prototype` methods, which are not available in all
 * supported browsers. Values in this set are checked by `this.has()` and values in the other set are checked by
 * `other.has()`, so subclasses with custom equality (e.g. `FrozenNodeSet` compares by ID) are respected.
 *
 * Values from the other set are deduplicated by the equality key passed to the constructor, as the other set could contain values which are
 * different by SameValueZero but equal in this set, e.g. 2 different node references with the same ID.
 *
 * `core-js-pure` (e.g. `core-js-pure/features/set/union.js`) is intentionally not used:
 *
 * - It returns its own wrapper `Set` instead of the native `Set`, thus, `instanceof Set` is `false`
 * - It clones this set into a new `Set` which compares by SameValueZero, ignoring `this.has()`, thus, custom equality
 *   is lost, e.g. `FrozenNodeSet.union()` would duplicate node references with the same ID
 */
abstract class SetView<T> implements ReadonlySet<T> {
  abstract get size(): number;
  abstract has(value: T): boolean;
  abstract keys(): SetIterator<T>;

  /**
   * @param getEqualityKey Gets the key used to compare values for equality, values with the same key are the same value
   *                       in this set. Subclasses with custom equality must pass it, e.g. `FrozenNodeSet` returns the ID
   *                       of a node reference. Defaults to the value itself.
   */
  constructor(getEqualityKey: (value: unknown) => unknown = value => value) {
    this.#getEqualityKey = getEqualityKey;
  }

  readonly #getEqualityKey: (value: unknown) => unknown;

  /**
   * Iterates values of the other set which are not in this set, values with the same equality key are only yielded
   * once.
   */
  *#iterateOtherValuesNotInThis<U>(other: ReadonlySetLike<U>): Generator<U, void, unknown> {
    const seenKeys = new Set<unknown>();

    for (const value of iterateSetLike(other)) {
      const key = this.#getEqualityKey(value);

      if (!hasValue(this, value) && !seenKeys.has(key)) {
        seenKeys.add(key);

        yield value;
      }
    }
  }

  difference(other: ReadonlySetLike<unknown>): Set<T> {
    const safeOther = validateSetLike(other);
    const result = new Set<T>();

    for (const value of this.keys()) {
      safeOther.has(value) || result.add(value);
    }

    return result;
  }

  *entries(): SetIterator<[T, T]> {
    for (const value of this.keys()) {
      yield [value, value];
    }
  }

  forEach(callbackfn: (value: T, value2: T, set: ReadonlySet<T>) => void, thisArg?: unknown): void {
    for (const value of this.keys()) {
      callbackfn.call(thisArg, value, value, this);
    }
  }

  intersection<U>(other: ReadonlySetLike<U>): Set<T & U> {
    const safeOther = validateSetLike(other);
    const otherSetLike: ReadonlySetLike<unknown> = safeOther;
    const result = new Set<T & U>();

    if (this.size <= safeOther.size) {
      for (const value of this.keys()) {
        // A value in both sets is both `T` and `U`.
        otherSetLike.has(value) && result.add(value satisfies T as T & U);
      }
    } else {
      const seenKeys = new Set<unknown>();

      for (const value of iterateSetLike(safeOther)) {
        const key = this.#getEqualityKey(value);

        if (hasValue(this, value) && !seenKeys.has(key)) {
          seenKeys.add(key);
          result.add(value satisfies U as T & U);
        }
      }
    }

    return result;
  }

  isDisjointFrom(other: ReadonlySetLike<unknown>): boolean {
    const safeOther = validateSetLike(other);

    if (this.size <= safeOther.size) {
      for (const value of this.keys()) {
        if (safeOther.has(value)) {
          return false;
        }
      }
    } else {
      for (const value of iterateSetLike(safeOther)) {
        if (hasValue(this, value)) {
          return false;
        }
      }
    }

    return true;
  }

  isSubsetOf(other: ReadonlySetLike<unknown>): boolean {
    const safeOther = validateSetLike(other);

    if (this.size > safeOther.size) {
      return false;
    }

    for (const value of this.keys()) {
      if (!safeOther.has(value)) {
        return false;
      }
    }

    return true;
  }

  isSupersetOf(other: ReadonlySetLike<unknown>): boolean {
    const safeOther = validateSetLike(other);

    // Unlike native `Set`, does not return `false` if this set is smaller than the other set, as the other set could
    // contain different values which are equal in this set, e.g. 2 different node references with the same ID.
    for (const value of iterateSetLike(safeOther)) {
      if (!hasValue(this, value)) {
        return false;
      }
    }

    return true;
  }

  symmetricDifference<U>(other: ReadonlySetLike<U>): Set<T | U> {
    const safeOther = validateSetLike(other);
    const otherSetLike: ReadonlySetLike<unknown> = safeOther;
    const result = new Set<T | U>();

    for (const value of this.keys()) {
      otherSetLike.has(value) || result.add(value);
    }

    for (const value of this.#iterateOtherValuesNotInThis(safeOther)) {
      result.add(value);
    }

    return result;
  }

  union<U>(other: ReadonlySetLike<U>): Set<T | U> {
    const safeOther = validateSetLike(other);
    const result = new Set<T | U>(this.keys());

    for (const value of this.#iterateOtherValuesNotInThis(safeOther)) {
      result.add(value);
    }

    return result;
  }

  values(): SetIterator<T> {
    return this.keys();
  }

  [Symbol.iterator](): SetIterator<T> {
    return this.keys();
  }
}

// `instanceof Set` should be `true`.
Object.setPrototypeOf(SetView.prototype, Set.prototype);

Object.defineProperties(SetView.prototype, {
  [Symbol.toStringTag]: { value: 'Set' }
});

Object.freeze(SetView.prototype);
Object.freeze(SetView);

export default SetView;
