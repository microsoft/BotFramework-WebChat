import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import { parse } from 'valibot';
import { nodeSchema } from '../node/Node.ts';
import editNode from './editNode.ts';
import { isReadonlySet } from './createReadonlySet.ts';
import getPartIds from './getPartIds.ts';

function catchError(fn: () => void): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }

  return undefined;
}

scenario(
  'editNode() with a new node',
  bdd => {
    bdd
      .given('a node with hasPart and isPartOf', () => ({
        '@id': '_:thread',
        '@type': new Set(['Thread']),
        hasPart: new Set([{ '@id': '_:m-1' }, { '@id': '_:m-2' }]),
        isPartOf: new Set([{ '@id': '_:conversation' }])
      }))
      .when('editNode() is called without a previous node', value => editNode(undefined, value))
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
      .given('a node created by editNode()', () =>
        editNode(undefined, {
          '@id': '_:conversation',
          '@type': new Set(['Conversation']),
          hasPart: new Set([{ '@id': '_:m-1' }])
        })
      )
      .when('spread with a new hasPart and passed to editNode() again', node =>
        editNode(node, { ...node, hasPart: new Set([{ '@id': '_:m-1' }, { '@id': '_:m-2' }]) })
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
      .given('a node without hasPart', () => editNode(undefined, { '@id': '_:m-1', '@type': new Set(['Message']) }))
      .when('getPartIds() is called', node => getPartIds(node, 'hasPart'))
      .then('should return an empty Set', (_, partIds) => expect(partIds.size).toBe(0));
  },
  NodeTest
);

scenario(
  'editNode() with a previous node',
  bdd => {
    bdd
      .given('a node created by editNode()', () =>
        editNode(undefined, {
          '@id': '_:conversation',
          '@type': new Set(['Conversation']),
          hasPart: new Set([{ '@id': '_:m-1' }, { '@id': '_:m-2' }]),
          isPartOf: new Set([{ '@id': '_:thread' }]),
          text: ['Hello, World!']
        })
      )
      .when('only hasPart is edited', node =>
        editNode(node, {
          ...node,
          hasPart: new Set([Array.from(node.hasPart ?? [])[1], { '@id': '_:m-3' }])
        })
      )
      .then('should equal to a validated node', (node, nextNode) =>
        expect(nextNode).toEqual(
          editNode(undefined, { ...node, hasPart: new Set([{ '@id': '_:m-2' }, { '@id': '_:m-3' }]) })
        )
      )
      .and('should keep the order of properties', (node, nextNode) =>
        expect(Object.keys(nextNode)).toEqual(Object.keys(node))
      )
      .and('should be frozen', (_, nextNode) => {
        expect(Object.isFrozen(nextNode)).toBe(true);
        expect(Array.from(nextNode.hasPart ?? []).every(reference => Object.isFrozen(reference))).toBe(true);
      })
      .and('should have hasPart as a read-only Set', (_, nextNode) =>
        expect(isReadonlySet(nextNode.hasPart)).toBe(true)
      )
      .and('should reuse unchanged references', (node, nextNode) =>
        expect(Array.from(nextNode.hasPart ?? [])[0]).toBe(Array.from(node.hasPart ?? [])[1])
      )
      .and('should reuse unchanged properties', (node, nextNode) => {
        expect(nextNode['@type']).toBe(node['@type']);
        expect(Object.getOwnPropertyDescriptor(nextNode, 'text')?.value).toBe(
          Object.getOwnPropertyDescriptor(node, 'text')?.value
        );
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
      .given('a node created by editNode()', () =>
        editNode(undefined, {
          '@id': '_:conversation',
          '@type': new Set(['Conversation']),
          hasPart: new Set([{ '@id': '_:m-1' }])
        })
      )
      .when('only hasPart is edited with an invalid reference', node =>
        catchError(() => editNode(node, { ...node, hasPart: new Set([{ '@id': 'invalid' }]) }))
      )
      .then('should throw', (_, error) => expect(error).toBeInstanceOf(Error));

    bdd
      .given('a node created by editNode()', () =>
        editNode(undefined, {
          '@id': '_:conversation',
          '@type': new Set(['Conversation']),
          hasPart: new Set([{ '@id': '_:m-1' }])
        })
      )
      .when('only hasPart is edited with a reference with extra properties', node =>
        catchError(() => editNode(node, { ...node, hasPart: new Set([{ '@id': '_:m-2', text: 'Hello' }]) }))
      )
      .then('should throw', (_, error) => expect(error).toBeInstanceOf(Error));

    bdd
      .given('a node created by editNode()', () =>
        editNode(undefined, {
          '@id': '_:conversation',
          '@type': new Set(['Conversation']),
          hasPart: new Set([{ '@id': '_:m-1' }])
        })
      )
      .when('hasPart is not a Set', node =>
        catchError(() => editNode(node, { ...node, hasPart: [{ '@id': '_:m-2' }] }))
      )
      .then('should throw', (_, error) => expect(error).toBeInstanceOf(Error));

    bdd
      .given('a node created by editNode()', () =>
        editNode(undefined, {
          '@id': '_:m-1',
          '@type': new Set(['Message']),
          isPartOf: new Set([{ '@id': '_:conversation' }])
        })
      )
      .when('isPartOf is edited to empty', node => editNode(node, { ...node, isPartOf: new Set() }))
      .then('should remove the property', (_, nextNode) => expect(nextNode).not.toHaveProperty('isPartOf'))
      .and('getPartIds() should return an empty Set', (_, nextNode) =>
        expect(getPartIds(nextNode, 'isPartOf').size).toBe(0)
      );

    bdd
      .given('a node created by editNode()', () =>
        editNode(undefined, {
          '@id': '_:conversation',
          '@type': new Set(['Conversation']),
          hasPart: new Set([{ '@id': '_:m-1' }])
        })
      )
      .when('a non-part property is edited with an invalid value', node =>
        catchError(() => editNode(node, { ...node, text: 'Not an array' }))
      )
      .then('should validate and throw', (_, error) => expect(error).toBeInstanceOf(Error));

    bdd
      .given('a node created by editNode()', () =>
        editNode(undefined, {
          '@id': '_:conversation',
          '@type': new Set(['Conversation']),
          hasPart: new Set([{ '@id': '_:m-1' }])
        })
      )
      .when('a non-part property is edited along with hasPart', node =>
        editNode(node, { ...node, hasPart: new Set([{ '@id': '_:m-2' }]), text: ['Hello'] })
      )
      .then('should create a validated node', (_, nextNode) =>
        expect(nextNode).toEqual({
          '@id': '_:conversation',
          '@type': new Set(['Conversation']),
          hasPart: new Set([{ '@id': '_:m-2' }]),
          text: ['Hello']
        })
      )
      .and('should be frozen', (_, nextNode) =>
        expect(Object.isFrozen(Object.getOwnPropertyDescriptor(nextNode, 'text')?.value)).toBe(true)
      );

    bdd
      .given('a node created by editNode()', () =>
        editNode(undefined, {
          '@id': '_:conversation',
          '@type': new Set(['Conversation']),
          hasPart: new Set([{ '@id': '_:m-1' }])
        })
      )
      .when('a non-part property is removed', node => {
        const { '@type': _, ...rest } = node;

        return catchError(() => editNode(node, rest));
      })
      .then('should validate and throw', (_, error) => expect(error).toBeInstanceOf(Error));

    bdd
      .given('a node created by editNode()', () =>
        editNode(undefined, {
          '@id': '_:conversation',
          '@type': new Set(['Conversation']),
          hasPart: new Set([{ '@id': '_:m-1' }])
        })
      )
      .when('nothing is edited', node => editNode(node, { ...node }))
      .then('should return the previous node', (node, nextNode) => expect(nextNode).toBe(node));
  },
  NodeTest
);
