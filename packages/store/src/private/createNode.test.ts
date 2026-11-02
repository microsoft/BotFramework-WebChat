import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import { parse } from 'valibot';
import { nodeSchema } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import createNode, { createTrustedNode } from './createNode.ts';
import { isReadonlySet } from './createReadonlySet.ts';
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
      .and('should only have enumerable properties from the input', (_, node) => {
        expect(Object.keys(node).sort()).toEqual(['@id', '@type', 'hasPart', 'isPartOf']);
        expect(
          Object.getOwnPropertySymbols(node).filter(
            symbol => Object.hasOwn(node, symbol) && Object.getOwnPropertyDescriptor(node, symbol)?.enumerable
          )
        ).toEqual([]);
      })
      .and('should not copy the cache via spread', (_, node) =>
        expect(Object.getOwnPropertySymbols({ ...node })).toEqual([])
      )
      .and('should equal to a plain node', (value, node) => expect(node).toEqual(value))
      .and('should serialize without the cache', (_, node) =>
        expect(Object.keys(JSON.parse(JSON.stringify(node))).sort()).toEqual(['@id', '@type', 'hasPart', 'isPartOf'])
      )
      .and('getPartIds() should return IDs in hasPart', (_, node) =>
        expect(Array.from(getPartIds(node, 'hasPart'))).toEqual(['_:m-1', '_:m-2'])
      )
      .and('getPartIds() should return IDs in isPartOf', (_, node) =>
        expect(Array.from(getPartIds(node, 'isPartOf'))).toEqual(['_:conversation'])
      )
      .and('getPartIds() should return the same cached Set on every call', (_, node) =>
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

scenario(
  'createTrustedNode',
  bdd => {
    bdd
      .given('a node created by createNode()', () =>
        createNode({
          '@id': '_:conversation',
          '@type': new Set(['Conversation']),
          hasPart: new Set([{ '@id': '_:m-1' }, { '@id': '_:m-2' }]),
          isPartOf: new Set([{ '@id': '_:thread' }]),
          text: ['Hello, World!']
        })
      )
      .when('createTrustedNode() is called with new hasPart', node =>
        createTrustedNode(node, { hasPart: new Set(['_:m-2', '_:m-3']) })
      )
      .then('should equal to createNode() output', (node, nextNode) =>
        expect(nextNode).toEqual(createNode({ ...node, hasPart: new Set([{ '@id': '_:m-2' }, { '@id': '_:m-3' }]) }))
      )
      .and('should keep the order of properties', (node, nextNode) =>
        expect(Object.keys(nextNode)).toEqual(Object.keys(node))
      )
      .and('should be frozen', (_, nextNode) => {
        expect(Object.isFrozen(nextNode)).toBe(true);
        expect(Array.from(nextNode.hasPart!).every(reference => Object.isFrozen(reference))).toBe(true);
      })
      .and('should have hasPart as a read-only Set', (_, nextNode) =>
        expect(isReadonlySet(nextNode.hasPart)).toBe(true)
      )
      .and('should reuse the reference of unchanged part IDs', (node, nextNode) =>
        expect(Array.from(nextNode.hasPart!)[0]).toBe(Array.from(node.hasPart!)[1])
      )
      .and('should reuse unchanged properties', (node, nextNode) => {
        expect(nextNode['@type']).toBe(node['@type']);
        expect(nextNode.isPartOf).toBe(node.isPartOf);
      })
      .and('getPartIds() should return the new IDs', (_, nextNode) =>
        expect(Array.from(getPartIds(nextNode, 'hasPart'))).toEqual(['_:m-2', '_:m-3'])
      )
      .and('getPartIds() should reuse the cache of unchanged property', (node, nextNode) =>
        expect(getPartIds(nextNode, 'isPartOf')).toBe(getPartIds(node, 'isPartOf'))
      )
      .and('previous node should keep its own IDs', node =>
        expect(Array.from(getPartIds(node, 'hasPart'))).toEqual(['_:m-1', '_:m-2'])
      );

    bdd
      .given('a node created by createNode()', () =>
        createNode({
          '@id': '_:m-1',
          '@type': new Set(['Message']),
          isPartOf: new Set([{ '@id': '_:conversation' }])
        })
      )
      .when('createTrustedNode() is called with empty isPartOf', node =>
        createTrustedNode(node, { isPartOf: new Set() })
      )
      .then('should remove the property', (_, nextNode) => expect(nextNode).not.toHaveProperty('isPartOf'))
      .and('getPartIds() should return an empty Set', (_, nextNode) =>
        expect(getPartIds(nextNode, 'isPartOf').size).toBe(0)
      );

    bdd
      .given('a node without hasPart', () =>
        createNode({ '@id': '_:conversation', '@type': new Set(['Conversation']) })
      )
      .when('createTrustedNode() is called with new hasPart', node => {
        const ids = new Set<Identifier>(['_:m-1']);
        const nextNode = createTrustedNode(node, { hasPart: ids });

        // Modifying the Set passed in should not affect the node.
        ids.add('_:m-2');

        return nextNode;
      })
      .then('should add the property', (_, nextNode) =>
        expect(nextNode).toEqual({
          '@id': '_:conversation',
          '@type': new Set(['Conversation']),
          hasPart: new Set([{ '@id': '_:m-1' }])
        })
      )
      .and('getPartIds() should not be affected by the caller', (_, nextNode) =>
        expect(Array.from(getPartIds(nextNode, 'hasPart'))).toEqual(['_:m-1'])
      );
  },
  NodeTest
);
