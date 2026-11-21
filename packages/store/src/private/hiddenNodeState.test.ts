import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import type { Identifier } from '../node/NodeIdentifier.ts';
import FrozenSkipList from '../structure/FrozenSkipList.ts';
import { getDateCreatedTime, getSortedChildIds, stampHiddenNodeState } from './hiddenNodeState.ts';

scenario(
  'hiddenNodeState',
  bdd => {
    bdd
      .given('a plain node', () => ({ '@id': '_:m-1', dateCreated: '2026-01-01T00:00:00Z' }))
      .when('hidden state is stamped and the node is frozen', node => {
        const sortedChildIds = new FrozenSkipList<Identifier>()
          .mutate()
          .insert('_:m-2', () => false)
          .commit();

        return {
          sortedChildIds,
          stampedNode: Object.freeze(stampHiddenNodeState(node, { dateCreatedTime: 123, sortedChildIds }))
        };
      })
      .then('should return the same object', (node, { stampedNode }) => expect(stampedNode).toBe(node))
      .and('should keep the object plain', (_, { stampedNode }) => {
        expect(Object.getPrototypeOf(stampedNode)).toBe(Object.prototype);
        expect(Reflect.ownKeys(stampedNode)).toEqual(['@id', 'dateCreated']);
        expect(JSON.stringify(stampedNode)).toBe('{"@id":"_:m-1","dateCreated":"2026-01-01T00:00:00Z"}');
      })
      .and('should return the cached dateCreated', (_, { stampedNode }) =>
        expect(getDateCreatedTime(stampedNode)).toBe(123)
      )
      .and('should return the sorted children', (_, { sortedChildIds, stampedNode }) =>
        expect(getSortedChildIds(stampedNode)).toBe(sortedChildIds)
      )
      .and('should lose hidden state when cloned', (_, { stampedNode }) => {
        const clonedNode = JSON.parse(JSON.stringify(stampedNode));

        expect(getDateCreatedTime(clonedNode)).toBe(Date.UTC(2026, 0, 1));
        expect(getSortedChildIds(clonedNode)).toBeUndefined();
      });

    bdd
      .given('a node without dateCreated', () => ({ '@id': '_:m-1' }))
      .when('getDateCreatedTime() is called', node => getDateCreatedTime(node))
      .then('should return Infinity', (_, time) => expect(time).toBe(Infinity));

    bdd
      .given('a frozen node', () => Object.freeze({ '@id': '_:m-1' }))
      .when(
        'hidden state is stamped',
        node => () => stampHiddenNodeState(node, { dateCreatedTime: 0, sortedChildIds: undefined })
      )
      .then('should throw', (_, fn) => expect(fn).toThrow('must not be frozen'));

    bdd
      .given('a stamped node', () =>
        stampHiddenNodeState({ '@id': '_:m-1' }, { dateCreatedTime: 0, sortedChildIds: undefined })
      )
      .when(
        'hidden state is stamped again',
        node => () => stampHiddenNodeState(node, { dateCreatedTime: 1, sortedChildIds: undefined })
      )
      .then('should throw', (_, fn) => expect(fn).toThrow('must not be frozen or stamped'));
  },
  NodeTest
);
