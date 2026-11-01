import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import { parse } from 'valibot';
import { nodeSchema } from '../node/Node.ts';
import createNode from './createNode.ts';
import getPartIds from './getPartIds.ts';

function getCacheOf(node: object): unknown {
  const [symbol] = Object.getOwnPropertySymbols(node);

  return symbol && Object.getOwnPropertyDescriptor(node, symbol)?.value;
}

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
      .given('a node created by createNode()', () =>
        createNode({
          '@id': '_:thread',
          '@type': new Set(['Thread']),
          hasPart: new Set([{ '@id': '_:m-1' }]),
          isPartOf: new Set([{ '@id': '_:conversation' }])
        })
      )
      .when('getPartIds() is not called yet', node => getCacheOf(node))
      .then('should not build the cache up front', (_, cache) =>
        expect(cache).toEqual({ hasPart: undefined, isPartOf: undefined })
      )
      .and('should build the cache for hasPart only after getPartIds() is called with hasPart', node => {
        const partIds = getPartIds(node, 'hasPart');

        expect(getCacheOf(node)).toEqual({ hasPart: { ids: partIds, source: node.hasPart }, isPartOf: undefined });
      });

    bdd
      .given('a node without hasPart', () => createNode({ '@id': '_:m-1', '@type': new Set(['Message']) }))
      .when('getPartIds() is called', node => getPartIds(node, 'hasPart'))
      .then('should return an empty Set', (_, partIds) => expect(partIds.size).toBe(0));
  },
  NodeTest
);
