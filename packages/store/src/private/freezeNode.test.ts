import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import type { Identifier } from '../node/NodeIdentifier.ts';
import FrozenSkipList from '../structure/FrozenSkipList.ts';
import createNode from './createNode.ts';
import { getDateCreatedTime } from './dateCreatedTime.ts';
import freezeNode from './freezeNode.ts';
import getPartIds from './getPartIds.ts';
import { getSortedChildIds } from './sortedChildIds.ts';

scenario(
  'freezeNode',
  bdd => {
    bdd
      .given('an unfrozen node with stale hasPart', () =>
        createNode({
          '@id': '_:thread',
          '@type': new Set(['Thread']),
          dateCreated: '2026-01-01T00:00:00Z',
          hasPart: new Set([{ '@id': '_:stale' }]),
          text: ['Hello']
        })
      )
      .when('freezeNode() is called with children and sorted children', node => {
        const sortedChildIds = new FrozenSkipList<Identifier>()
          .mutate()
          .insert('_:m-1', () => false)
          .commit();

        return { frozenNode: freezeNode(node, new Set(['_:m-1']), sortedChildIds), sortedChildIds };
      })
      .then('should freeze the node in place without copying', (node, { frozenNode }) => {
        expect(frozenNode).toBe(node);
        expect(Object.isFrozen(frozenNode)).toBe(true);
      })
      .and('should have hasPart generated from children', (_, { frozenNode }) =>
        expect(Array.from(getPartIds(frozenNode, 'hasPart'))).toEqual(['_:m-1'])
      )
      .and('should attach sorted children', (_, { frozenNode, sortedChildIds }) =>
        expect(getSortedChildIds(frozenNode)).toBe(sortedChildIds)
      )
      .and('should keep the cached dateCreated', (_, { frozenNode }) =>
        expect(getDateCreatedTime(frozenNode)).toBe(Date.UTC(2026, 0, 1))
      )
      .and('should not have enumerable hidden properties', (_, { frozenNode }) =>
        expect(Object.keys(frozenNode).sort()).toEqual(['@id', '@type', 'dateCreated', 'hasPart', 'text'])
      );

    bdd
      .given('an unfrozen node with stale hasPart', () =>
        createNode({ '@id': '_:thread', '@type': new Set(['Thread']), hasPart: new Set([{ '@id': '_:stale' }]) })
      )
      .when('freezeNode() is called without children', node => freezeNode(node, new Set(), undefined))
      .then('should not have hasPart', (_, frozenNode) => expect(frozenNode).not.toHaveProperty('hasPart'))
      .and('should not have sorted children', (_, frozenNode) => expect(getSortedChildIds(frozenNode)).toBeUndefined());

    bdd
      .given('a frozen node', () =>
        freezeNode(createNode({ '@id': '_:m-1', '@type': new Set(['Message']) }), new Set(), undefined)
      )
      .when(
        'freezeNode() is called again with children',
        node => () =>
          // @ts-expect-error InternalNode is not UnfrozenNode.
          freezeNode(node, new Set(['_:m-2']), undefined)
      )
      .then('should throw', (_, fn) => expect(fn).toThrow(TypeError));
  },
  NodeTest
);
