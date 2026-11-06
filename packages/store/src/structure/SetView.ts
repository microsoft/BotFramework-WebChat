/**
 * Implements read methods of a `Set` based on `has()`, `size`, and `keys()`.
 */
abstract class SetView<T> implements ReadonlySet<T> {
  abstract get size(): number;
  abstract has(value: T): boolean;
  abstract keys(): SetIterator<T>;

  difference<U>(other: ReadonlySetLike<U>): Set<T> {
    return new Set(this.keys()).difference(other);
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
    return new Set(this.keys()).intersection(other);
  }

  isDisjointFrom(other: ReadonlySetLike<unknown>): boolean {
    return new Set(this.keys()).isDisjointFrom(other);
  }

  isSubsetOf(other: ReadonlySetLike<unknown>): boolean {
    return new Set(this.keys()).isSubsetOf(other);
  }

  isSupersetOf(other: ReadonlySetLike<unknown>): boolean {
    return new Set(this.keys()).isSupersetOf(other);
  }

  symmetricDifference<U>(other: ReadonlySetLike<U>): Set<T | U> {
    return new Set(this.keys()).symmetricDifference(other);
  }

  union<U>(other: ReadonlySetLike<U>): Set<T | U> {
    return new Set(this.keys()).union(other);
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
