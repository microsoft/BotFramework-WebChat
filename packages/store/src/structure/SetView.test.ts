import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import FrozenNodeSet from './FrozenNodeSet.ts';
import FrozenSet from './FrozenSet.ts';

const SET_METHOD_NAMES = Object.freeze([
  'difference',
  'intersection',
  'isDisjointFrom',
  'isSubsetOf',
  'isSupersetOf',
  'symmetricDifference',
  'union'
] as const);

/**
 * Runs the function as if in browsers without Set methods (Chrome 100, Firefox 100, Safari 15), by temporarily removing
 * them from `Set.prototype`.
 */
function withoutNativeSetMethods<T>(fn: () => T): T {
  const descriptors = SET_METHOD_NAMES.map(
    name => [name, Object.getOwnPropertyDescriptor(Set.prototype, name)] as const
  );

  for (const [name] of descriptors) {
    Reflect.deleteProperty(Set.prototype, name);
  }

  try {
    return fn();
  } finally {
    for (const [name, descriptor] of descriptors) {
      descriptor && Reflect.defineProperty(Set.prototype, name, descriptor);
    }
  }
}

scenario(
  'SetView in browsers without native Set methods',
  bdd => {
    bdd
      .given('a FrozenSet and a Set', () => ({ other: new Set([2, 3]), set: new FrozenSet([1, 2]) }))
      .when('Set methods are called without native Set methods', ({ other, set }) =>
        withoutNativeSetMethods(() => ({
          difference: set.difference(other),
          intersection: set.intersection(other),
          isDisjointFrom: set.isDisjointFrom(other),
          isSubsetOf: set.isSubsetOf(other),
          isSupersetOf: set.isSupersetOf(other),
          symmetricDifference: set.symmetricDifference(other),
          union: set.union(other)
        }))
      )
      .then('should return difference()', (_, result) => expect(Array.from(result.difference)).toEqual([1]))
      .and('should return intersection()', (_, result) => expect(Array.from(result.intersection)).toEqual([2]))
      .and('should return isDisjointFrom()', (_, result) => expect(result.isDisjointFrom).toBe(false))
      .and('should return isSubsetOf()', (_, result) => expect(result.isSubsetOf).toBe(false))
      .and('should return isSupersetOf()', (_, result) => expect(result.isSupersetOf).toBe(false))
      .and('should return symmetricDifference()', (_, result) =>
        expect(Array.from(result.symmetricDifference)).toEqual([1, 3])
      )
      .and('should return union()', (_, result) => expect(Array.from(result.union)).toEqual([1, 2, 3]));

    bdd
      .given('a FrozenNodeSet', () => new FrozenNodeSet(['_:m-1', '_:m-2']))
      .when('union() is called without native Set methods', nodeSet =>
        withoutNativeSetMethods(() => nodeSet.union(new Set([{ '@id': '_:m-3' }])))
      )
      .then('should return the union', (_, result) =>
        expect(Array.from(result, ({ '@id': id }) => id)).toEqual(['_:m-1', '_:m-2', '_:m-3'])
      );
  },
  NodeTest
);

/** Calls the function and returns its value or the error thrown. */
function tryCall<T>(fn: () => T): { readonly error: unknown } | { readonly value: T } {
  try {
    return Object.freeze({ value: fn() });
  } catch (error) {
    return Object.freeze({ error });
  }
}

scenario(
  'SetView with invalid set-like size',
  bdd => {
    for (const name of SET_METHOD_NAMES) {
      bdd
        .given('a Set, a FrozenSet, and a set-like object with negative size', () => ({
          frozenSet: new FrozenSet([1]),
          other: { has: () => false, keys: () => [].values(), size: -1 },
          set: new Set([1])
        }))
        .when(`${name}() is called on both native Set and FrozenSet`, ({ frozenSet, other, set }) => ({
          // `name` is from a constant list of Set method names.
          // eslint-disable-next-line security/detect-object-injection
          actual: tryCall(() => frozenSet[name](other)),
          // eslint-disable-next-line security/detect-object-injection
          expected: tryCall(() => set[name](other))
        }))
        .then('native Set should throw RangeError', (_, { expected }) =>
          expect(expected).toEqual({ error: expect.any(RangeError) })
        )
        .and('FrozenSet should throw RangeError, as native Set does', (_, { actual }) =>
          expect(actual).toEqual({ error: expect.any(RangeError) })
        );
    }

    bdd
      .given('a Set, a FrozenSet, and a set-like object with size of -0.5', () => ({
        frozenSet: new FrozenSet([1]),
        other: { has: () => false, keys: () => [].values(), size: -0.5 },
        set: new Set([1])
      }))
      .when('union() is called on both native Set and FrozenSet', ({ frozenSet, other, set }) => ({
        actual: tryCall(() => Array.from(frozenSet.union(other))),
        expected: tryCall(() => Array.from(set.union(other)))
      }))
      .then('native Set should not throw as ToIntegerOrInfinity(-0.5) is 0', (_, { expected }) =>
        expect(expected).toEqual({ value: [1] })
      )
      .and('FrozenSet should return the same as native Set', (_, { actual, expected }) =>
        expect(actual).toEqual(expected)
      );

    for (const name of SET_METHOD_NAMES) {
      bdd
        .given('an empty Set, an empty FrozenSet, and a set-like object with size of -0.5', () => ({
          frozenSet: new FrozenSet<number>([]),
          other: { has: () => false, keys: () => [].values(), size: -0.5 },
          set: new Set<number>()
        }))
        .when(`${name}() is called on both native Set and FrozenSet`, ({ frozenSet, other, set }) => {
          const toComparable = (value: unknown) => (value instanceof Set ? Array.from(value) : value);

          return {
            // `name` is from a constant list of Set method names.
            // eslint-disable-next-line security/detect-object-injection
            actual: tryCall(() => toComparable(frozenSet[name](other))),
            // eslint-disable-next-line security/detect-object-injection
            expected: tryCall(() => toComparable(set[name](other)))
          };
        })
        .then('FrozenSet should compare with the size normalized to 0, as native Set does', (_, { actual, expected }) =>
          expect(actual).toEqual(expected)
        );
    }
  },
  NodeTest
);

/** Gets IDs of node references, including duplicates. */
function toIds(set: Iterable<{ readonly '@id': string }>): string[] {
  return Array.from(set, ({ '@id': id }) => id);
}

scenario(
  'FrozenNodeSet set methods with other set of node references',
  bdd => {
    bdd
      .given('a FrozenNodeSet of _:a and a Set of 2 different node references to _:b', () => ({
        nodeSet: new FrozenNodeSet(['_:a']),
        other: new Set([{ '@id': '_:b' }, { '@id': '_:b' }])
      }))
      .when('union() is called', ({ nodeSet, other }) => nodeSet.union(other))
      .then('should not duplicate _:b', (_, result) => expect(toIds(result)).toEqual(['_:a', '_:b']));

    bdd
      .given('a FrozenNodeSet of _:a and a Set of 2 different node references to _:b', () => ({
        nodeSet: new FrozenNodeSet(['_:a']),
        other: new Set([{ '@id': '_:b' }, { '@id': '_:b' }])
      }))
      .when('symmetricDifference() is called', ({ nodeSet, other }) => nodeSet.symmetricDifference(other))
      .then('should not duplicate _:b', (_, result) => expect(toIds(result)).toEqual(['_:a', '_:b']));

    bdd
      .given('a FrozenNodeSet of _:a, _:b, _:c and a Set of 2 different node references to _:a', () => ({
        nodeSet: new FrozenNodeSet(['_:a', '_:b', '_:c']),
        other: new Set([{ '@id': '_:a' }, { '@id': '_:a' }])
      }))
      .when('intersection() is called', ({ nodeSet, other }) => nodeSet.intersection(other))
      .then('should not duplicate _:a', (_, result) => expect(toIds(result)).toEqual(['_:a']));

    bdd
      .given('a FrozenNodeSet of _:a and a Set of 2 different node references to _:a', () => ({
        nodeSet: new FrozenNodeSet(['_:a']),
        other: new Set([{ '@id': '_:a' }, { '@id': '_:a' }])
      }))
      .when('isSupersetOf() is called', ({ nodeSet, other }) => nodeSet.isSupersetOf(other))
      .then('should be true', (_, result) => expect(result).toBe(true));
  },
  NodeTest
);

/**
 * Creates a set-like object whose `keys()` returns a non-iterable iterator, which records whether it is closed via
 * `return()`.
 */
function createClosableSetLike(values: readonly number[]) {
  const state = { numReturnCalled: 0 };

  return Object.freeze({
    has: (value: unknown) => values.includes(value as number),
    keys: () => {
      let index = 0;

      // Intentionally not iterable (no `[Symbol.iterator]`), as `Set` methods do not require it.
      return {
        next: () =>
          index < values.length ? { done: false, value: values[index++] } : { done: true, value: undefined },
        return: () => {
          state.numReturnCalled++;

          return { done: true, value: undefined };
        }
      };
    },
    size: values.length,
    state
  });
}

scenario(
  'SetView should close the iterator of the other set-like object on early termination',
  bdd => {
    bdd
      .given('a Set, a FrozenSet of 1, 2, 3, and 2 set-like objects of 1 with closable iterators', () => ({
        actualOther: createClosableSetLike([1]),
        expectedOther: createClosableSetLike([1]),
        frozenSet: new FrozenSet([1, 2, 3]),
        set: new Set([1, 2, 3])
      }))
      .when(
        'isDisjointFrom() is called on both native Set and FrozenSet',
        ({ actualOther, expectedOther, frozenSet, set }) => ({
          actual: frozenSet.isDisjointFrom(actualOther),
          expected: set.isDisjointFrom(expectedOther)
        })
      )
      .then('should return false', (_, { actual, expected }) => {
        expect(expected).toBe(false);
        expect(actual).toBe(false);
      })
      .and('native Set should close the iterator', ({ expectedOther }) =>
        expect(expectedOther.state.numReturnCalled).toBe(1)
      )
      .and('FrozenSet should close the iterator, as native Set does', ({ actualOther }) =>
        expect(actualOther.state.numReturnCalled).toBe(1)
      );

    bdd
      .given('a Set, a FrozenSet of 1, 2, 3, and 2 set-like objects of 4 with closable iterators', () => ({
        actualOther: createClosableSetLike([4]),
        expectedOther: createClosableSetLike([4]),
        frozenSet: new FrozenSet([1, 2, 3]),
        set: new Set([1, 2, 3])
      }))
      .when(
        'isSupersetOf() is called on both native Set and FrozenSet',
        ({ actualOther, expectedOther, frozenSet, set }) => ({
          actual: frozenSet.isSupersetOf(actualOther),
          expected: set.isSupersetOf(expectedOther)
        })
      )
      .then('should return false', (_, { actual, expected }) => {
        expect(expected).toBe(false);
        expect(actual).toBe(false);
      })
      .and('native Set should close the iterator', ({ expectedOther }) =>
        expect(expectedOther.state.numReturnCalled).toBe(1)
      )
      .and('FrozenSet should close the iterator, as native Set does', ({ actualOther }) =>
        expect(actualOther.state.numReturnCalled).toBe(1)
      );
  },
  NodeTest
);
