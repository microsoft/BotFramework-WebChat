import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import type { Identifier } from '../node/NodeIdentifier.ts';
import FrozenNodeSet, { getNodeSetIds } from './FrozenNodeSet.ts';
import FrozenSet from './FrozenSet.ts';

scenario(
  'new FrozenNodeSet()',
  bdd => {
    bdd
      .given('IDs', (): Identifier[] => ['_:m-1', '_:m-2'])
      .when('new FrozenNodeSet() is called', ids => new FrozenNodeSet(ids))
      .then('should be a Set', (_, nodeSet) => expect(nodeSet).toBeInstanceOf(Set))
      .and('should be frozen', (_, nodeSet) => expect(Object.isFrozen(nodeSet)).toBe(true))
      .and('should have size', (_, nodeSet) => expect(nodeSet.size).toBe(2))
      .and('should iterate node references', (_, nodeSet) =>
        expect(Array.from(nodeSet)).toEqual([{ '@id': '_:m-1' }, { '@id': '_:m-2' }])
      )
      .and('should iterate frozen node references', (_, nodeSet) =>
        expect(Array.from(nodeSet.values()).every(reference => Object.isFrozen(reference))).toBe(true)
      )
      .and('should equal to a plain Set of node references', (_, nodeSet) =>
        expect(nodeSet).toEqual(new Set([{ '@id': '_:m-1' }, { '@id': '_:m-2' }]))
      )
      .and('should check node references by ID', (_, nodeSet) => {
        expect(nodeSet.has({ '@id': '_:m-1' })).toBe(true);
        expect(nodeSet.has({ '@id': '_:m-3' })).toBe(false);
      })
      .and('should not have non-reference values', (_, nodeSet) => {
        expect(nodeSet.has('_:m-1' as never)).toBe(false);
        expect(nodeSet.has(undefined as never)).toBe(false);
      })
      .and('should be cloned into a plain Set of node references', (_, nodeSet) => {
        const set = new Set(nodeSet);

        set.add({ '@id': '_:m-3' });

        expect(Array.from(set, ({ '@id': id }) => id)).toEqual(['_:m-1', '_:m-2', '_:m-3']);
        expect(nodeSet.size).toBe(2);
      })
      .and('getNodeSetIds() should return the IDs', (_, nodeSet) =>
        expect(Array.from(getNodeSetIds(nodeSet) ?? [])).toEqual(['_:m-1', '_:m-2'])
      )
      .and('getNodeSetIds() should return a read-only Set of IDs', (_, nodeSet) =>
        expect(() => (getNodeSetIds(nodeSet) as Set<Identifier>).add('_:m-3')).toThrow(TypeError)
      )
      .and('should not expose the IDs as properties', (_, nodeSet) => {
        expect(Object.keys(nodeSet)).toEqual([]);
        expect(Object.getOwnPropertySymbols(nodeSet)).toEqual([]);
      });

    bdd
      .given('a mutable array of IDs', (): Identifier[] => ['_:m-1'])
      .when('new FrozenNodeSet() is called and the array is modified', ids => {
        const nodeSet = new FrozenNodeSet(ids);

        ids.push('_:m-2');

        return nodeSet;
      })
      .then('should not be affected', (_, nodeSet) => expect(nodeSet.size).toBe(1));

    bdd
      .given('a read-only Set of IDs', () => new FrozenSet<Identifier>(['_:m-1']))
      .when('new FrozenNodeSet() is called', ids => new FrozenNodeSet(ids))
      .then('getNodeSetIds() should return the same Set without copying', (ids, nodeSet) =>
        expect(getNodeSetIds(nodeSet)).toBe(ids)
      );

    bdd
      .given('a node set', (): ReadonlySet<unknown> => new FrozenNodeSet(['_:m-1']))
      .when.oneOf<() => unknown>([
        ['add() is called', nodeSet => () => (nodeSet as Set<unknown>).add({ '@id': '_:m-2' })],
        ['clear() is called', nodeSet => () => (nodeSet as Set<unknown>).clear()],
        ['delete() is called', nodeSet => () => (nodeSet as Set<unknown>).delete({ '@id': '_:m-1' })],
        ['Set.prototype.add.call() is called', nodeSet => () => Set.prototype.add.call(nodeSet, { '@id': '_:m-2' })]
      ])
      .then('should throw', (_, fn) => expect(fn).toThrow(TypeError))
      .and('should not be modified', nodeSet => expect(Array.from(nodeSet)).toEqual([{ '@id': '_:m-1' }]));

    bdd
      .given('a plain Set of node references', () => new Set([{ '@id': '_:m-1' }]))
      .when('getNodeSetIds() is called', set => getNodeSetIds(set))
      .then('should return undefined', (_, ids) => expect(ids).toBeUndefined());
  },
  NodeTest
);

scenario(
  'FrozenNodeSet Set methods should compare node references by ID',
  bdd => {
    bdd
      .given('two FrozenNodeSet with overlapping IDs', () => ({
        nodeSet: new FrozenNodeSet(['_:m-1', '_:m-2', '_:m-3']),
        other: new FrozenNodeSet(['_:m-2', '_:m-3'])
      }))
      .when('Set methods are called', ({ nodeSet, other }) => ({
        difference: nodeSet.difference(other),
        intersection: nodeSet.intersection(other),
        isDisjointFrom: nodeSet.isDisjointFrom(other),
        isSubsetOf: nodeSet.isSubsetOf(other),
        isSupersetOf: nodeSet.isSupersetOf(other),
        isSupersetOfItself: nodeSet.isSupersetOf(nodeSet),
        symmetricDifference: nodeSet.symmetricDifference(other),
        union: nodeSet.union(other),
        unionWithItself: nodeSet.union(nodeSet)
      }))
      .then('difference() should compare by ID', (_, result) =>
        expect(Array.from(result.difference, ({ '@id': id }) => id)).toEqual(['_:m-1'])
      )
      .and('intersection() should compare by ID', (_, result) =>
        expect(Array.from(result.intersection, ({ '@id': id }) => id)).toEqual(['_:m-2', '_:m-3'])
      )
      .and('isDisjointFrom() should compare by ID', (_, result) => expect(result.isDisjointFrom).toBe(false))
      .and('isSubsetOf() should compare by ID', (_, result) => expect(result.isSubsetOf).toBe(false))
      .and('isSupersetOf() should compare by ID', (_, result) => expect(result.isSupersetOf).toBe(true))
      .and('isSupersetOf() itself should be true', (_, result) => expect(result.isSupersetOfItself).toBe(true))
      .and('symmetricDifference() should compare by ID', (_, result) =>
        expect(Array.from(result.symmetricDifference, ({ '@id': id }) => id)).toEqual(['_:m-1'])
      )
      .and('union() should not duplicate references with the same ID', (_, result) =>
        expect(Array.from(result.union, ({ '@id': id }) => id)).toEqual(['_:m-1', '_:m-2', '_:m-3'])
      )
      .and('union() with itself should not duplicate references', (_, result) =>
        expect(Array.from(result.unionWithItself, ({ '@id': id }) => id)).toEqual(['_:m-1', '_:m-2', '_:m-3'])
      );

    bdd
      .given('a FrozenNodeSet and a Set of node references with the same IDs', () => ({
        nodeSet: new FrozenNodeSet(['_:m-1', '_:m-2']),
        other: new Set([{ '@id': '_:m-1' }, { '@id': '_:m-2' }])
      }))
      .when('isSupersetOf() is called', ({ nodeSet, other }) => nodeSet.isSupersetOf(other))
      .then('should be true', (_, result) => expect(result).toBe(true));
  },
  NodeTest
);

scenario(
  'FrozenNodeSet Set methods should not treat a string as a node reference with the same ID',
  bdd => {
    bdd.given
      .oneOf<{ readonly nodeSet: FrozenNodeSet; readonly other: ReadonlySet<unknown> }>([
        [
          'a FrozenNodeSet and a Set of a string followed by a node reference of the same ID',
          () => ({ nodeSet: new FrozenNodeSet(['_:a']), other: new Set(['_:b', Object.freeze({ '@id': '_:b' })]) })
        ],
        [
          'a FrozenNodeSet and a Set of a node reference followed by a string of the same ID',
          () => ({ nodeSet: new FrozenNodeSet(['_:a']), other: new Set([Object.freeze({ '@id': '_:b' }), '_:b']) })
        ]
      ])
      .when('union() and symmetricDifference() are called', ({ nodeSet, other }) => ({
        symmetricDifference: nodeSet.symmetricDifference(other),
        union: nodeSet.union(other)
      }))
      .then('union() should keep both the string and the node reference', ({ other }, { union }) =>
        expect(Array.from(union)).toEqual([{ '@id': '_:a' }, ...other])
      )
      .and('symmetricDifference() should keep both the string and the node reference', ({ other }, result) =>
        expect(Array.from(result.symmetricDifference)).toEqual([{ '@id': '_:a' }, ...other])
      );
  },
  NodeTest
);
