import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import type { Identifier } from '../node/NodeIdentifier.ts';
import ReadonlyNodeSet, { getNodeSetIds } from './ReadonlyNodeSet.ts';
import ReadonlySet from './ReadonlySet.ts';

scenario(
  'new ReadonlyNodeSet()',
  bdd => {
    bdd
      .given('IDs', (): Identifier[] => ['_:m-1', '_:m-2'])
      .when('new ReadonlyNodeSet() is called', ids => new ReadonlyNodeSet(ids))
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
      .when('new ReadonlyNodeSet() is called and the array is modified', ids => {
        const nodeSet = new ReadonlyNodeSet(ids);

        ids.push('_:m-2');

        return nodeSet;
      })
      .then('should not be affected', (_, nodeSet) => expect(nodeSet.size).toBe(1));

    bdd
      .given('a read-only Set of IDs', () => new ReadonlySet<Identifier>(['_:m-1']))
      .when('new ReadonlyNodeSet() is called', ids => new ReadonlyNodeSet(ids))
      .then('getNodeSetIds() should return the same Set without copying', (ids, nodeSet) =>
        expect(getNodeSetIds(nodeSet)).toBe(ids)
      );

    bdd
      .given('a node set', (): globalThis.ReadonlySet<unknown> => new ReadonlyNodeSet(['_:m-1']))
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
