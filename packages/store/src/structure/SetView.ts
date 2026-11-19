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
 * Validates a set-like object as `Set` methods do, i.e. `size` is a number, `has()` and `keys()` are functions.
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
 */
abstract class SetView<T> implements ReadonlySet<T> {
  abstract get size(): number;
  abstract has(value: T): boolean;
  abstract keys(): SetIterator<T>;

  difference(other: ReadonlySetLike<unknown>): Set<T> {
    const safeOther = validateSetLike(other);
    const result = new Set<T>();

    for (const value of this.keys()) {
      safeOther.has(value) || result.add(value);
    }

    return result;
  }

  entries(): SetIterator<[T, T]> {
    return new Set(this.keys()).entries();
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
      for (const value of iterateSetLike(safeOther)) {
        hasValue(this, value) && result.add(value satisfies U as T & U);
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

    if (this.size < safeOther.size) {
      return false;
    }

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

    for (const value of iterateSetLike(safeOther)) {
      hasValue(this, value) || result.add(value);
    }

    return result;
  }

  union<U>(other: ReadonlySetLike<U>): Set<T | U> {
    const safeOther = validateSetLike(other);
    const result = new Set<T | U>(this.keys());

    for (const value of iterateSetLike(safeOther)) {
      hasValue(this, value) || result.add(value);
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
