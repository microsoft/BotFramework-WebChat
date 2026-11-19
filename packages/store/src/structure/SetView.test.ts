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
