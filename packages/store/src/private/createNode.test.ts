import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import { parse } from 'valibot';
import { nodeSchema } from '../node/Node.ts';
import createNode from './createNode.ts';
import getPartIds from './getPartIds.ts';

scenario(
  'createNode',
  bdd => {
    bdd
      .given('a node with hasPart and isPartOf', () => ({
        '@id': '_:thread',
        '@type': new Set(['Thread']),
        hasPart: new Set([{ '@id': '_:m-1' }, { '@id': '_:m-2' }]),
        isPartOf: new Set([{ '@id': '_:conversation' }])
      }))
      .when('createNode() is called', value => createNode(value))
      .then('should be frozen', (_, node) => expect(Object.isFrozen(node)).toBe(true))
      .and('should only have properties from the input', (_, node) => {
        expect(Object.keys(node).sort()).toEqual(['@id', '@type', 'hasPart', 'isPartOf']);
        expect(Object.getOwnPropertySymbols(node)).toEqual([]);
      })
      .and('should equal to a plain node', (value, node) => expect(node).toEqual(value))
      .and('should store hasPart and isPartOf as read-only Set', (_, node) => {
        expect(node.hasPart).toBeInstanceOf(Set);
        expect(node.isPartOf).toBeInstanceOf(Set);
        expect(() => (node.hasPart as Set<unknown>).add({ '@id': '_:m-3' })).toThrow(TypeError);
      })
      .and('getPartIds() should return IDs in hasPart', (_, node) =>
        expect(Array.from(getPartIds(node, 'hasPart'))).toEqual(['_:m-1', '_:m-2'])
      )
      .and('getPartIds() should return IDs in isPartOf', (_, node) =>
        expect(Array.from(getPartIds(node, 'isPartOf'))).toEqual(['_:conversation'])
      )
      .and('getPartIds() should return the same Set on every call without copying', (_, node) =>
        expect(getPartIds(node, 'hasPart')).toBe(getPartIds(node, 'hasPart'))
      )
      .and('getPartIds() should return a read-only Set', (_, node) =>
        expect(() => (getPartIds(node, 'hasPart') as Set<string>).add('_:m-3')).toThrow(TypeError)
      );

    bdd
      .given('a node created by createNode()', () =>
        createNode({
          '@id': '_:conversation',
          '@type': new Set(['Conversation']),
          hasPart: new Set([{ '@id': '_:m-1' }])
        })
      )
      .when('spread with a new hasPart and passed to createNode() again', node =>
        createNode({ ...node, hasPart: new Set([{ '@id': '_:m-1' }, { '@id': '_:m-2' }]) })
      )
      .then('getPartIds() should return the rebuilt IDs', (_, node) =>
        expect(Array.from(getPartIds(node, 'hasPart'))).toEqual(['_:m-1', '_:m-2'])
      )
      .and('previous node should keep its own IDs', node =>
        expect(Array.from(getPartIds(node, 'hasPart'))).toEqual(['_:m-1'])
      );

    bdd
      .given('a node created by createNode()', () =>
        createNode({
          '@id': '_:thread',
          '@type': new Set(['Thread']),
          hasPart: new Set([{ '@id': '_:m-1' }]),
          isPartOf: new Set([{ '@id': '_:conversation' }])
        })
      )
      .when('spread and passed to createNode() again', node => createNode({ ...node }))
      .then('should reuse hasPart without copying', (node, nextNode) => expect(nextNode.hasPart).toBe(node.hasPart))
      .and('should reuse isPartOf without copying', (node, nextNode) => expect(nextNode.isPartOf).toBe(node.isPartOf))
      .and('should be a different node', (node, nextNode) => expect(nextNode).not.toBe(node));

    bdd
      .given('a node created by createNode()', () =>
        createNode({
          '@id': '_:thread',
          '@type': new Set(['Thread']),
          isPartOf: new Set([{ '@id': '_:conversation' }])
        })
      )
      .when('isPartOf is cloned, modified, and passed to createNode() again', node => {
        const isPartOf = new Set(node.isPartOf);

        isPartOf.add({ '@id': '_:channel' });

        return createNode({ ...node, isPartOf });
      })
      .then('should have the new isPartOf', (_, nextNode) =>
        expect(Array.from(getPartIds(nextNode, 'isPartOf'))).toEqual(['_:conversation', '_:channel'])
      )
      .and('should store isPartOf as read-only Set', (_, nextNode) =>
        expect(() => (nextNode.isPartOf as Set<unknown>).add({ '@id': '_:m-3' })).toThrow(TypeError)
      )
      .and('should keep the previous isPartOf intact', node =>
        expect(Array.from(getPartIds(node, 'isPartOf'))).toEqual(['_:conversation'])
      );

    bdd
      .given('a node without the cache', () =>
        parse(nodeSchema, {
          '@id': '_:conversation',
          '@type': new Set(['Conversation']),
          hasPart: new Set([{ '@id': '_:m-1' }])
        })
      )
      .when('getPartIds() is called', node => getPartIds(node, 'hasPart'))
      .then('should build the IDs', (_, partIds) => expect(Array.from(partIds)).toEqual(['_:m-1']));

    bdd
      .given('a node without hasPart', () => createNode({ '@id': '_:m-1', '@type': new Set(['Message']) }))
      .when('getPartIds() is called', node => getPartIds(node, 'hasPart'))
      .then('should return an empty Set', (_, partIds) => expect(partIds.size).toBe(0));
  },
  NodeTest
);
