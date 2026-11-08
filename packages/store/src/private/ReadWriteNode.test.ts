import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import type { Identifier } from '../node/NodeIdentifier.ts';
import FrozenSkipList from '../structure/FrozenSkipList.ts';
import createNode from './createNode.ts';
import { getDateCreatedTime } from './dateCreatedTime.ts';
import getPartIds from './getPartIds.ts';
import ReadWriteNode from './ReadWriteNode.ts';
import { getSortedChildIds } from './sortedChildIds.ts';

function createMessage(): ReturnType<typeof createNode> {
  return createNode({
    '@id': '_:m-1',
    '@type': new Set(['Message']),
    citation: [{ '@id': '_:c-1' }, { '@id': '_:c-2' }],
    dateCreated: '2026-01-01T00:00:00Z',
    hasPart: new Set([{ '@id': '_:stale' }]),
    isPartOf: new Set([{ '@id': '_:c-1' }]),
    mentions: [{ '@id': '_:c-1' }],
    text: ['Hello']
  });
}

scenario(
  'new ReadWriteNode()',
  bdd => {
    bdd
      .given('a node', () => createMessage())
      .when('committed without changes', node => new ReadWriteNode(node).commit(new Set(), undefined))
      .then('should be a new frozen node', (node, nextNode) => {
        expect(nextNode).not.toBe(node);
        expect(Object.isFrozen(nextNode)).toBe(true);
      })
      .and('should not have hasPart', (_, nextNode) => expect(nextNode).not.toHaveProperty('hasPart'))
      .and('should reuse unchanged property values', (node, nextNode) => {
        expect(nextNode.isPartOf).toBe(node.isPartOf);
        expect(Reflect.get(nextNode, 'citation')).toBe(Reflect.get(node, 'citation'));
      })
      .and('should keep the cached dateCreated', (_, nextNode) =>
        expect(getDateCreatedTime(nextNode)).toBe(Date.UTC(2026, 0, 1))
      );

    bdd
      .given('a node', () => createMessage())
      .when('committed with children and sorted children', node => {
        const sortedChildIds = new FrozenSkipList<Identifier>()
          .mutate()
          .insert('_:m-2', () => false)
          .commit();

        return { nextNode: new ReadWriteNode(node).commit(new Set(['_:m-2']), sortedChildIds), sortedChildIds };
      })
      .then('should have hasPart generated from children', (_, { nextNode }) =>
        expect(Array.from(getPartIds(nextNode, 'hasPart'))).toEqual(['_:m-2'])
      )
      .and('should attach sorted children', (_, { nextNode, sortedChildIds }) =>
        expect(getSortedChildIds(nextNode)).toBe(sortedChildIds)
      );
  },
  NodeTest
);

scenario(
  'ReadWriteNode.setPartOf()',
  bdd => {
    bdd
      .given('a draft of a node', () => {
        const node = createMessage();

        return { draft: new ReadWriteNode(node), node };
      })
      .when.oneOf<{ readonly actual: unknown; readonly expected: unknown }>([
        [
          'a new parent is added',
          ({ draft }) => ({
            actual: [draft.setPartOf('_:c-2', true), Array.from(draft.getPartOfIds())],
            expected: [true, ['_:c-1', '_:c-2']]
          })
        ],
        [
          'an existing parent is added',
          ({ draft }) => ({
            actual: [draft.setPartOf('_:c-1', true), Array.from(draft.getPartOfIds())],
            expected: [false, ['_:c-1']]
          })
        ],
        [
          'an existing parent is removed',
          ({ draft }) => ({
            actual: [draft.setPartOf('_:c-1', false), Array.from(draft.getPartOfIds())],
            expected: [true, []]
          })
        ],
        [
          'a non-existing parent is removed',
          ({ draft }) => ({
            actual: [draft.setPartOf('_:c-2', false), Array.from(draft.getPartOfIds())],
            expected: [false, ['_:c-1']]
          })
        ]
      ])
      .then('should return whether isPartOf is changed and have the expected parents', (_, { actual, expected }) =>
        expect(actual).toEqual(expected)
      )
      .and('should not modify the original node', ({ node }) =>
        expect(Array.from(getPartIds(node, 'isPartOf'))).toEqual(['_:c-1'])
      );

    bdd
      .given('a draft with a parent added', () => {
        const draft = new ReadWriteNode(createMessage());

        draft.setPartOf('_:c-2', true);

        return draft;
      })
      .when('committed', draft => draft.commit(new Set(), undefined))
      .then('should have isPartOf with changes', (_, nextNode) =>
        expect(Array.from(getPartIds(nextNode, 'isPartOf'))).toEqual(['_:c-1', '_:c-2'])
      )
      .and('should keep other properties', (_, nextNode) => {
        expect(Reflect.get(nextNode, 'text')).toEqual(['Hello']);
        expect(nextNode).not.toHaveProperty('hasPart');
      })
      .and('should be frozen', (_, nextNode) => expect(Object.isFrozen(nextNode)).toBe(true));

    bdd
      .given('a draft committed once', () => {
        const draft = new ReadWriteNode(createMessage());

        draft.setPartOf('_:c-2', true);

        return { draft, firstNode: draft.commit(new Set(), undefined) };
      })
      .when('modified and committed again', ({ draft }) => {
        draft.setPartOf('_:c-3', true);

        return draft.commit(new Set(), undefined);
      })
      .then('should have all changes', (_, nextNode) =>
        expect(Array.from(getPartIds(nextNode, 'isPartOf'))).toEqual(['_:c-1', '_:c-2', '_:c-3'])
      )
      .and('should not modify the first committed node', ({ firstNode }) =>
        expect(Array.from(getPartIds(firstNode, 'isPartOf'))).toEqual(['_:c-1', '_:c-2'])
      );
  },
  NodeTest
);

scenario(
  'ReadWriteNode.removeReferencesTo()',
  bdd => {
    bdd
      .given('a draft of a node referencing "_:c-1" in multiple properties', () => new ReadWriteNode(createMessage()))
      .when('references to "_:c-1" are removed', draft => ({
        changed: draft.removeReferencesTo('_:c-1'),
        nextNode: draft.commit(new Set(), undefined),
        referenceIds: Array.from(draft.getReferenceIds())
      }))
      .then('should return true', (_, { changed }) => expect(changed).toBe(true))
      .and('should remove the reference from arrays', (_, { nextNode }) =>
        expect(Reflect.get(nextNode, 'citation')).toEqual([{ '@id': '_:c-2' }])
      )
      .and('should keep arrays frozen', (_, { nextNode }) =>
        expect(Object.isFrozen(Reflect.get(nextNode, 'citation'))).toBe(true)
      )
      .and('should remove properties which become empty', (_, { nextNode }) => {
        expect(nextNode).not.toHaveProperty('isPartOf');
        expect(nextNode).not.toHaveProperty('mentions');
      })
      .and('should not reference "_:c-1" anymore', (_, { referenceIds }) => expect(referenceIds).toEqual(['_:c-2']));

    bdd
      .given('a draft of a node', () => new ReadWriteNode(createMessage()))
      .when('references to a node which is not referenced are removed', draft => ({
        changed: draft.removeReferencesTo('_:c-9'),
        referenceIds: Array.from(draft.getReferenceIds()).sort()
      }))
      .then('should return false', (_, { changed }) => expect(changed).toBe(false))
      .and('should keep all references', (_, { referenceIds }) => expect(referenceIds).toEqual(['_:c-1', '_:c-2']));
  },
  NodeTest
);

scenario(
  'ReadWriteNode.getReferenceIds()',
  bdd => {
    bdd
      .given('a draft of a node with stale hasPart', () => new ReadWriteNode(createMessage()))
      .when('reference IDs are read', draft => draft.getReferenceIds())
      .then('should exclude hasPart', (_, referenceIds) => expect(referenceIds.has('_:stale')).toBe(false))
      .and('should include isPartOf and other references', (_, referenceIds) =>
        expect(Array.from(referenceIds).sort()).toEqual(['_:c-1', '_:c-2'])
      );
  },
  NodeTest
);
