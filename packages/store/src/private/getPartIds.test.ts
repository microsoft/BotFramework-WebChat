import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import type { NodeReference } from '../node/NodeReference.ts';
import createNode from './createNode.ts';
import getPartIds from './getPartIds.ts';

scenario(
  'getPartIds',
  bdd => {
    bdd
      .given('a node created by createNode()', () =>
        createNode({ '@id': '_:m-1', '@type': new Set(['Message']), isPartOf: new Set([{ '@id': '_:conversation' }]) })
      )
      .when('getPartIds() is called twice', node => ({
        ids1: getPartIds(node, 'isPartOf'),
        ids2: getPartIds(node, 'isPartOf')
      }))
      .then('should return the IDs', (_, { ids1 }) => expect(Array.from(ids1)).toEqual(['_:conversation']))
      .and('should return the same set', (_, { ids1, ids2 }) => expect(ids2).toBe(ids1));

    bdd
      .given('a node with a native Set of node references', () =>
        Object.freeze({ hasPart: Object.freeze(new Set<NodeReference>([{ '@id': '_:m-1' }, { '@id': '_:m-2' }])) })
      )
      .when('getPartIds() is called twice', node => ({
        ids1: getPartIds(node, 'hasPart'),
        ids2: getPartIds(node, 'hasPart')
      }))
      .then('should return the IDs', (_, { ids1 }) => expect(Array.from(ids1)).toEqual(['_:m-1', '_:m-2']))
      .and('should cache the built IDs and return the same set', (_, { ids1, ids2 }) => expect(ids2).toBe(ids1))
      .and('should return a frozen set', (_, { ids1 }) => expect(Object.isFrozen(ids1)).toBe(true));

    bdd
      .given('two nodes sharing the same native Set of node references', () => {
        const hasPart = new Set<NodeReference>([{ '@id': '_:m-1' }]);

        return [{ hasPart }, { hasPart }] as const;
      })
      .when('getPartIds() is called on both nodes', ([node1, node2]) => ({
        ids1: getPartIds(node1, 'hasPart'),
        ids2: getPartIds(node2, 'hasPart')
      }))
      .then('should return the same set', (_, { ids1, ids2 }) => expect(ids2).toBe(ids1));

    bdd
      .given('a node without the property', () => ({}))
      .when('getPartIds() is called', node => getPartIds(node, 'hasPart'))
      .then('should return an empty set', (_, ids) => expect(ids.size).toBe(0));
  },
  NodeTest
);
