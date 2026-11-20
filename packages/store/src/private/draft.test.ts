import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import type { Identifier } from '../node/NodeIdentifier.ts';
import { getNodeSetIds } from '../structure/FrozenNodeSet.ts';
import FrozenSet from '../structure/FrozenSet.ts';
import FrozenSkipList from '../structure/FrozenSkipList.ts';
import createNode from './createNode.ts';
import {
  commitDraft,
  createDraft,
  getDraftPartOfIds,
  getDraftReferenceIds,
  readDraft,
  removeDraftReferencesTo,
  setDraftPartOf
} from './draft.ts';
import type { DraftNode } from './DraftNode.ts';
import getPartIds from './getPartIds.ts';
import { getDateCreatedTime, getSortedChildIds } from './hiddenNodeState.ts';

const NO_CHILDREN = new FrozenSet<Identifier>();

function createMessage(): DraftNode {
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
  'commitDraft()',
  bdd => {
    bdd
      .given('a frozen node in the graph with hasPart', () =>
        commitDraft(createDraft(createMessage()), new FrozenSet(['_:stale']), undefined)
      )
      .when('committed without changes', node => commitDraft(createDraft(node), NO_CHILDREN, undefined))
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
      )
      .and('should keep the property order', (node, nextNode) =>
        expect(Object.keys(nextNode)).toEqual(Object.keys(node).filter(key => key !== 'hasPart'))
      );

    bdd
      .given('an unfrozen node created by createNode() without hasPart', () =>
        createNode({ '@id': '_:m-1', '@type': new Set(['Message']), text: ['Hello'] })
      )
      .when('committed without changes', node => commitDraft(createDraft(node), NO_CHILDREN, undefined))
      .then('should freeze the node in place without copying', (node, nextNode) => {
        expect(nextNode).toBe(node);
        expect(Object.isFrozen(nextNode)).toBe(true);
      })
      .and('should not have enumerable hidden properties', (_, nextNode) =>
        expect(Object.keys(nextNode)).toEqual(['@id', '@type', 'text'])
      );

    bdd
      .given('an unfrozen node created by createNode() with stale hasPart', () => createMessage())
      .when('committed without children', node => commitDraft(createDraft(node), NO_CHILDREN, undefined))
      .then('should not have hasPart', (_, nextNode) => expect(nextNode).not.toHaveProperty('hasPart'))
      .and('should be frozen', (_, nextNode) => expect(Object.isFrozen(nextNode)).toBe(true));

    bdd
      .given('a draft of an unfrozen node committed once', () => {
        const draft = createDraft(createMessage());

        return { draft, firstNode: commitDraft(draft, NO_CHILDREN, undefined) };
      })
      .when('references are removed and committed again', ({ draft }) => {
        removeDraftReferencesTo(draft, '_:c-2');

        return commitDraft(draft, NO_CHILDREN, undefined);
      })
      .then('should copy on write', ({ firstNode }, nextNode) => expect(nextNode).not.toBe(firstNode))
      .and('should not modify the first committed node', ({ firstNode }) =>
        expect(Reflect.get(firstNode, 'citation')).toEqual([{ '@id': '_:c-1' }, { '@id': '_:c-2' }])
      )
      .and('should have the change', (_, nextNode) =>
        expect(Reflect.get(nextNode, 'citation')).toEqual([{ '@id': '_:c-1' }])
      )
      .and('should keep the cached dateCreated', (_, nextNode) =>
        expect(getDateCreatedTime(nextNode)).toBe(Date.UTC(2026, 0, 1))
      );

    bdd
      .given('a node', () => createMessage())
      .when('committed with children and sorted children', node => {
        const childIds = new FrozenSet<Identifier>(['_:m-2']);
        const sortedChildIds = new FrozenSkipList<Identifier>()
          .mutate()
          .insert('_:m-2', () => false)
          .commit();

        return { childIds, nextNode: commitDraft(createDraft(node), childIds, sortedChildIds), sortedChildIds };
      })
      .then('should have hasPart generated from children', (_, { nextNode }) =>
        expect(Array.from(getPartIds(nextNode, 'hasPart'))).toEqual(['_:m-2'])
      )
      .and('should use the children as-is without copying', (_, { childIds, nextNode }) =>
        expect(getNodeSetIds(nextNode.hasPart)).toBe(childIds)
      )
      .and('should attach sorted children', (_, { nextNode, sortedChildIds }) =>
        expect(getSortedChildIds(nextNode)).toBe(sortedChildIds)
      );

    bdd
      .given('a frozen node with children', () => {
        const childIds = new FrozenSet<Identifier>(['_:m-2']);

        return { childIds, node: commitDraft(createDraft(createMessage()), childIds, undefined) };
      })
      .when('committed again with the same children', ({ childIds, node }) =>
        commitDraft(createDraft(node), childIds, undefined)
      )
      .then('should reuse hasPart', ({ node }, nextNode) => expect(nextNode.hasPart).toBe(node.hasPart));
  },
  NodeTest
);

scenario(
  'readDraft()',
  bdd => {
    bdd
      .given('a draft of a frozen node with a parent added', () => {
        const node = commitDraft(createDraft(createMessage()), NO_CHILDREN, undefined);
        const draft = createDraft(node);

        setDraftPartOf(draft, '_:c-2', true);

        return { draft, node };
      })
      .when('read with children', ({ draft }) => {
        const childIds = new FrozenSet<Identifier>(['_:m-2']);

        return { childIds, readNode: readDraft(draft, childIds) };
      })
      .then('should return a new unfrozen node', ({ node }, { readNode }) => {
        expect(readNode).not.toBe(node);
        expect(Object.isFrozen(readNode)).toBe(false);
      })
      .and('should have current isPartOf', (_, { readNode }) =>
        expect(Array.from(getPartIds(readNode, 'isPartOf'))).toEqual(['_:c-1', '_:c-2'])
      )
      .and('should have hasPart using the children as-is', (_, { childIds, readNode }) =>
        expect(getNodeSetIds(readNode.hasPart)).toBe(childIds)
      )
      .and('should share isPartOf with the draft', ({ draft }, { readNode }) =>
        expect(getNodeSetIds(readNode.isPartOf)).toBe(getDraftPartOfIds(draft))
      )
      .and('should not modify the draft when the node is modified', ({ draft }, { readNode }) => {
        Reflect.set(readNode, 'text', ['Aloha']);

        expect(Reflect.get(commitDraft(draft, NO_CHILDREN, undefined), 'text')).toEqual(['Hello']);
      });
  },
  NodeTest
);

scenario(
  'setDraftPartOf()',
  bdd => {
    bdd
      .given('a draft of a node', () => {
        const node = createMessage();

        return { draft: createDraft(node), node };
      })
      .when.oneOf<{ readonly actual: unknown; readonly expected: unknown }>([
        [
          'a new parent is added',
          ({ draft }) => ({
            actual: [setDraftPartOf(draft, '_:c-2', true), Array.from(getDraftPartOfIds(draft))],
            expected: [true, ['_:c-1', '_:c-2']]
          })
        ],
        [
          'an existing parent is added',
          ({ draft }) => ({
            actual: [setDraftPartOf(draft, '_:c-1', true), Array.from(getDraftPartOfIds(draft))],
            expected: [false, ['_:c-1']]
          })
        ],
        [
          'an existing parent is removed',
          ({ draft }) => ({
            actual: [setDraftPartOf(draft, '_:c-1', false), Array.from(getDraftPartOfIds(draft))],
            expected: [true, []]
          })
        ],
        [
          'a non-existing parent is removed',
          ({ draft }) => ({
            actual: [setDraftPartOf(draft, '_:c-2', false), Array.from(getDraftPartOfIds(draft))],
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
        const draft = createDraft(createMessage());

        setDraftPartOf(draft, '_:c-2', true);

        return draft;
      })
      .when('committed', draft => commitDraft(draft, NO_CHILDREN, undefined))
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
        const draft = createDraft(createMessage());

        setDraftPartOf(draft, '_:c-2', true);

        return { draft, firstNode: commitDraft(draft, NO_CHILDREN, undefined) };
      })
      .when('modified and committed again', ({ draft }) => {
        setDraftPartOf(draft, '_:c-3', true);

        return commitDraft(draft, NO_CHILDREN, undefined);
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
  'removeDraftReferencesTo()',
  bdd => {
    bdd
      .given('a draft of a node referencing "_:c-1" in multiple properties', () => createDraft(createMessage()))
      .when('references to "_:c-1" are removed', draft => ({
        changed: removeDraftReferencesTo(draft, '_:c-1'),
        nextNode: commitDraft(draft, NO_CHILDREN, undefined),
        referenceIds: Array.from(getDraftReferenceIds(draft))
      }))
      .then('should return true', (_, { changed }) => expect(changed).toBe(true))
      .and('should remove the reference from arrays', (_, { nextNode }) =>
        expect(Reflect.get(nextNode, 'citation')).toEqual([{ '@id': '_:c-2' }])
      )
      .and('should keep arrays frozen', (_, { nextNode }) =>
        expect(Object.isFrozen(Reflect.get(nextNode, 'citation'))).toBe(true)
      )
      .and('should remove properties which become empty', (_, { nextNode }) => {
        expect(Object.keys(nextNode)).not.toContain('mentions');
        expect(nextNode).not.toHaveProperty('isPartOf');
        expect(nextNode).not.toHaveProperty('mentions');
      })
      .and('should not reference "_:c-1" anymore', (_, { referenceIds }) => expect(referenceIds).toEqual(['_:c-2']));

    bdd
      .given('a draft of a node', () => createDraft(createMessage()))
      .when('references to a node which is not referenced are removed', draft => ({
        changed: removeDraftReferencesTo(draft, '_:c-9'),
        node: draft.node,
        referenceIds: Array.from(getDraftReferenceIds(draft)).sort()
      }))
      .then('should return false', (_, { changed }) => expect(changed).toBe(false))
      .and('should not copy the node', (draft, { node }) => expect(node).toBe(draft.node))
      .and('should keep all references', (_, { referenceIds }) => expect(referenceIds).toEqual(['_:c-1', '_:c-2']));
  },
  NodeTest
);

scenario(
  'getDraftReferenceIds()',
  bdd => {
    bdd
      .given('a draft of a node with stale hasPart', () => createDraft(createMessage()))
      .when('reference IDs are read', draft => getDraftReferenceIds(draft))
      .then('should exclude hasPart', (_, referenceIds) => expect(referenceIds.has('_:stale')).toBe(false))
      .and('should include isPartOf and other references', (_, referenceIds) =>
        expect(Array.from(referenceIds).sort()).toEqual(['_:c-1', '_:c-2'])
      );
  },
  NodeTest
);
