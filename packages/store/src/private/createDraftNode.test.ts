import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import { parse } from 'valibot';
import { nodeSchema } from '../node/Node.ts';
import FrozenNodeSet from '../structure/FrozenNodeSet.ts';
import createDraftNode from './createDraftNode.ts';
import Draft from './draft.ts';
import { draftNodeSchema, type DraftNode } from './DraftNode.ts';
import FrozenSet from '../structure/FrozenSet.ts';
import { getHasPartIds, getIsPartOfIds } from './getPartIds.ts';
import type { FrozenNode } from './FrozenNode.ts';
import { getDateCreatedTime } from './hiddenNodeState.ts';

/** Gets a property of the node which is not in the node schema, e.g. `text`. */
function getProperty(node: object, key: string): unknown {
  return Reflect.get(node, key);
}

scenario(
  'createDraftNode',
  bdd => {
    bdd
      .given('a node with hasPart and isPartOf', () => ({
        '@id': '_:thread',
        '@type': new Set(['Thread']),
        hasPart: new Set([{ '@id': '_:m-1' }, { '@id': '_:m-2' }]),
        isPartOf: new Set([{ '@id': '_:conversation' }])
      }))
      .when('createDraftNode() is called', value => createDraftNode(value))
      .then('should not be frozen, so it can be modified in place before Draft.commit()', (_, node) =>
        expect(Object.isFrozen(node)).toBe(false)
      )
      .and('should only have properties from the input', (_, node) => {
        expect(Object.keys(node).sort()).toEqual(['@id', '@type', 'hasPart', 'isPartOf']);
        expect(
          Object.getOwnPropertySymbols(node).filter(symbol => Object.prototype.propertyIsEnumerable.call(node, symbol))
        ).toEqual([]);
      })
      .and('should equal to a plain node', (value, node) => expect(node).toEqual(value))
      .and('should store hasPart and isPartOf as read-only Set', (_, node) => {
        expect(node.hasPart).toBeInstanceOf(Set);
        expect(node.isPartOf).toBeInstanceOf(Set);
        expect(() => (node.hasPart as Set<unknown>).add({ '@id': '_:m-3' })).toThrow(TypeError);
      })
      .and('getHasPartIds() should return IDs in hasPart', (_, node) =>
        expect(Array.from(getHasPartIds(node))).toEqual(['_:m-1', '_:m-2'])
      )
      .and('getIsPartOfIds() should return IDs in isPartOf', (_, node) =>
        expect(Array.from(getIsPartOfIds(node))).toEqual(['_:conversation'])
      )
      .and('getHasPartIds() should return the same Set on every call without copying', (_, node) =>
        expect(getHasPartIds(node)).toBe(getHasPartIds(node))
      )
      .and('getHasPartIds() should return a read-only Set', (_, node) =>
        expect(() => (getHasPartIds(node) as Set<string>).add('_:m-3')).toThrow(TypeError)
      );

    bdd
      .given('a node created by createDraftNode()', () =>
        createDraftNode({
          '@id': '_:conversation',
          '@type': new Set(['Conversation']),
          hasPart: new Set([{ '@id': '_:m-1' }])
        })
      )
      .when('spread with a new hasPart and passed to createDraftNode() again', node =>
        createDraftNode({ ...node, hasPart: new Set([{ '@id': '_:m-1' }, { '@id': '_:m-2' }]) })
      )
      .then('getHasPartIds() should return the rebuilt IDs', (_, node) =>
        expect(Array.from(getHasPartIds(node))).toEqual(['_:m-1', '_:m-2'])
      )
      .and('previous node should keep its own IDs', node => expect(Array.from(getHasPartIds(node))).toEqual(['_:m-1']));

    bdd
      .given('a node created by createDraftNode()', () =>
        createDraftNode({
          '@id': '_:thread',
          '@type': new Set(['Thread']),
          hasPart: new Set([{ '@id': '_:m-1' }]),
          isPartOf: new Set([{ '@id': '_:conversation' }])
        })
      )
      .when('spread and passed to createDraftNode() again', node => createDraftNode({ ...node }))
      .then('should reuse hasPart without copying', (node, nextNode) => expect(nextNode.hasPart).toBe(node.hasPart))
      .and('should reuse isPartOf without copying', (node, nextNode) => expect(nextNode.isPartOf).toBe(node.isPartOf))
      .and('should be a different node', (node, nextNode) => expect(nextNode).not.toBe(node));

    bdd
      .given('a node created by createDraftNode()', () =>
        createDraftNode({
          '@id': '_:thread',
          '@type': new Set(['Thread']),
          isPartOf: new Set([{ '@id': '_:conversation' }])
        })
      )
      .when('isPartOf is cloned, modified, and passed to createDraftNode() again', node => {
        const isPartOf = new Set(node.isPartOf);

        isPartOf.add({ '@id': '_:channel' });

        return createDraftNode({ ...node, isPartOf });
      })
      .then('should have the new isPartOf', (_, nextNode) =>
        expect(Array.from(getIsPartOfIds(nextNode))).toEqual(['_:conversation', '_:channel'])
      )
      .and('should store isPartOf as read-only Set', (_, nextNode) =>
        expect(() => (nextNode.isPartOf as Set<unknown>).add({ '@id': '_:m-3' })).toThrow(TypeError)
      )
      .and('should keep the previous isPartOf intact', node =>
        expect(Array.from(getIsPartOfIds(node))).toEqual(['_:conversation'])
      );

    bdd
      .given('a node with hasPart which is not a FrozenNodeSet', () =>
        parse(draftNodeSchema, {
          '@id': '_:conversation',
          '@type': new Set(['Conversation']),
          hasPart: new Set([{ '@id': '_:m-1' }])
        })
      )
      .when('getHasPartIds() is called', node => {
        try {
          return getHasPartIds(node);
        } catch (error) {
          return error;
        }
      })
      .then('should throw', (_, error) =>
        expect(error).toEqual(new Error('ASSERTION: hasPart of node "_:conversation" must be a FrozenNodeSet'))
      );

    bdd
      .given('a node without hasPart', () => createDraftNode({ '@id': '_:m-1', '@type': new Set(['Message']) }))
      .when('getHasPartIds() is called', node => getHasPartIds(node))
      .then('should return an empty Set', (_, partIds) => expect(partIds.size).toBe(0));

    bdd
      .given('a node with dateCreated', () => ({
        '@id': '_:m-1',
        '@type': new Set(['Message']),
        dateCreated: '2026-01-01T08:00:00+08:00'
      }))
      .when('createDraftNode() is called', value => createDraftNode(value))
      .then('getDateCreatedTime() should return the parsed time', (_, node) =>
        expect(getDateCreatedTime(node)).toBe(Date.UTC(2026, 0, 1))
      )
      .and('should keep dateCreated as-is', (_, node) =>
        expect(node).toHaveProperty('dateCreated', '2026-01-01T08:00:00+08:00')
      )
      .and('should cache the time after Draft.commit()', (_, node) =>
        expect(getDateCreatedTime(new Draft(node).commit(new FrozenSet(), undefined))).toBe(Date.UTC(2026, 0, 1))
      );

    bdd
      .given('a node without dateCreated', () => createDraftNode({ '@id': '_:m-1', '@type': new Set(['Message']) }))
      .when('getDateCreatedTime() is called', node => getDateCreatedTime(node))
      .then('should return Infinity', (_, time) => expect(time).toBe(Infinity));

    bdd
      .given('a node validated but not created by createDraftNode()', () =>
        parse(nodeSchema, { '@id': '_:m-1', '@type': new Set(['Message']) })
      )
      .when('createDraftNode() is called', node => createDraftNode(node))
      .then('should return DraftNode', (node, draftNode) => {
        // @ts-expect-error Node is not DraftNode, only nodes created by createDraftNode() are branded.
        const unbrandedNode: DraftNode = node;
        const brandedNode: DraftNode = draftNode;

        expect(brandedNode).toEqual(unbrandedNode);
      })
      .and('should not be assignable to FrozenNode', (_, draftNode) => {
        // @ts-expect-error Only nodes committed by Draft.commit() are stored in the graph.
        const frozenNode: FrozenNode = draftNode;

        expect(frozenNode).toBe(draftNode);
      });

    bdd
      .given('a node created by createDraftNode()', () =>
        createDraftNode({
          '@id': '_:m-1',
          '@type': new Set(['Message']),
          text: ['Hello, World!', { '@type': '@json', '@value': { items: [1, 2, { three: 3 }] } }]
        })
      )
      .when('spread and passed to createDraftNode() again', node =>
        createDraftNode({ ...node, keywords: ['greeting'] } satisfies object)
      )
      .then('should reuse @type as-is', (node, nextNode) => expect(nextNode['@type']).toBe(node['@type']))
      .and('should reuse deeply frozen property value as-is', (node, nextNode) =>
        expect(getProperty(nextNode, 'text')).toBe(getProperty(node, 'text'))
      )
      .and('should freeze new property value', (_, nextNode) => {
        expect(Object.isFrozen(getProperty(nextNode, 'keywords'))).toBe(true);
        expect(getProperty(nextNode, 'keywords')).toEqual(['greeting']);
      });

    bdd
      .given('a property value which is deeply frozen by the caller', () =>
        Object.freeze([
          Object.freeze({ '@type': '@json', '@value': Object.freeze({ items: Object.freeze([1, 2]) }) }),
          'Hello, World!'
        ])
      )
      .when('createDraftNode() is called', value =>
        createDraftNode({ '@id': '_:m-1', '@type': new Set(['Message']), text: value })
      )
      .then('should reuse the property value as-is', (value, node) => expect(getProperty(node, 'text')).toBe(value));

    bdd
      .given(
        'a property value which is shallowly frozen with a deeply frozen JSON literal and a mutable JSON literal',
        () => {
          const frozenLiteral = Object.freeze({ '@type': '@json', '@value': Object.freeze([1, 2]) });
          const mutableLiteral = { '@type': '@json', '@value': { items: [3] } };

          return { frozenLiteral, mutableLiteral, value: Object.freeze([frozenLiteral, mutableLiteral]) };
        }
      )
      .when('createDraftNode() is called', ({ value }) =>
        createDraftNode({ '@id': '_:m-1', '@type': new Set(['Message']), text: value })
      )
      .then('should copy the property value', ({ value }, node) => {
        expect(getProperty(node, 'text')).not.toBe(value);
        expect(getProperty(node, 'text')).toEqual(value);
      })
      .and('should reuse the deeply frozen JSON literal', ({ frozenLiteral }, node) => {
        const [literal] = getProperty(node, 'text') as readonly unknown[];

        expect(literal).toBe(frozenLiteral);
      })
      .and('should copy and deeply freeze the mutable JSON literal', ({ mutableLiteral }, node) => {
        const [, literal] = getProperty(node, 'text') as readonly { '@value': { items: number[] } }[];

        expect(literal).not.toBe(mutableLiteral);
        expect(Object.isFrozen(literal)).toBe(true);
        expect(Object.isFrozen(literal?.['@value'])).toBe(true);
        expect(Object.isFrozen(literal?.['@value'].items)).toBe(true);

        mutableLiteral['@value'].items.push(4);

        expect(literal?.['@value'].items).toEqual([3]);
      });

    bdd.given
      .oneOf<readonly unknown[]>([
        [
          'a frozen array containing a frozen JSON literal with a getter',
          () => {
            let value = 0;

            return Object.freeze([
              Object.freeze(
                Object.defineProperty({ '@type': '@json' }, '@value', { enumerable: true, get: () => ++value })
              )
            ]);
          }
        ],
        [
          'a frozen array containing a frozen JSON literal with a symbol key',
          () => Object.freeze([Object.freeze({ '@type': '@json', '@value': 1, [Symbol('hidden')]: 1 })])
        ],
        [
          'a frozen array containing a frozen JSON literal with a non-enumerable property',
          () =>
            Object.freeze([
              Object.freeze(Object.defineProperty({ '@type': '@json', '@value': 1 }, 'hidden', { value: 1 }))
            ])
        ],
        ['a frozen array with an extra property', () => Object.freeze(Object.assign(['Hello, World!'], { extra: 1 }))],
        [
          'a frozen array with a subclass prototype',
          () => {
            class MyArray<T> extends Array<T> {}

            return Object.freeze(MyArray.from(['Hello, World!']));
          }
        ]
      ])
      .when('createDraftNode() is called', value =>
        createDraftNode({ '@id': '_:m-1', '@type': new Set(['Message']), text: value })
      )
      .then('should not reuse the property value', (value, node) => expect(getProperty(node, 'text')).not.toBe(value))
      .and('should deeply freeze the copy with own enumerable data properties only', (_, node) => {
        const text = getProperty(node, 'text') as readonly unknown[];

        expect(Object.getPrototypeOf(text)).toBe(Array.prototype);
        expect(Reflect.ownKeys(text)).toEqual(['0', 'length']);
        expect(Object.isFrozen(text)).toBe(true);

        const [item] = text;

        if (item && typeof item === 'object') {
          expect(Reflect.ownKeys(item)).toEqual(['@type', '@value']);
          expect(Reflect.getOwnPropertyDescriptor(item, '@value')).toHaveProperty('value');
          expect(Object.isFrozen(item)).toBe(true);
        }
      });

    bdd
      .given('a frozen mutable Set', () => Object.freeze(new Set(['Message'])))
      .when('createDraftNode() is called', value => createDraftNode({ '@id': '_:m-1', '@type': value }))
      .then('should not reuse the Set', (value, node) => expect(node['@type']).not.toBe(value))
      .and('should store as read-only Set', (_, node) =>
        expect(() => (node['@type'] as Set<string>).add('Thing')).toThrow(TypeError)
      );
  },
  NodeTest
);

scenario(
  'createDraftNode with JSON literal',
  bdd => {
    bdd
      .given('a node with a JSON literal which is not plain JSON', () => {
        const json = { a: [undefined], date: new Date(0), nan: NaN, undefined };

        return {
          json,
          value: { '@id': '_:m-1', '@type': new Set(['Message']), encoding: [{ '@type': '@json', '@value': json }] }
        };
      })
      .when('createDraftNode() is called', ({ value }) => createDraftNode(value))
      .then('should store the JSON literal as JSON.parse(JSON.stringify())', ({ json }, node) =>
        expect(getProperty(node, 'encoding')).toEqual([
          { '@type': '@json', '@value': JSON.parse(JSON.stringify(json)) }
        ])
      )
      .and('should store Date as ISO string', (_, node) =>
        expect(getProperty(node, 'encoding')).toEqual([
          { '@type': '@json', '@value': expect.objectContaining({ date: '1970-01-01T00:00:00.000Z' }) }
        ])
      )
      .and('should store NaN as null and undefined in array as null', (_, node) =>
        expect(getProperty(node, 'encoding')).toEqual([
          { '@type': '@json', '@value': expect.objectContaining({ a: [null], nan: null }) }
        ])
      )
      .and('should remove key with value of undefined', (_, node) => {
        const encoding = getProperty(node, 'encoding') as readonly { readonly '@value': object }[];

        expect(Object.keys(encoding[0]?.['@value'] ?? {}).sort()).toEqual(['a', 'date', 'nan']);
      })
      .and('should deeply freeze the JSON literal', (_, node) => {
        const encoding = getProperty(node, 'encoding') as readonly { readonly '@value': object }[];

        expect(Object.isFrozen(encoding[0]?.['@value'])).toBe(true);
      })
      .and('should not modify the input', ({ json }) => {
        expect(json.date).toBeInstanceOf(Date);
        expect(json.nan).toBeNaN();
        expect(json).toHaveProperty('undefined', undefined);
        expect(json.a).toEqual([undefined]);
      });
  },
  NodeTest
);

scenario(
  'createDraftNode with accessors on hasPart/isPartOf',
  bdd => {
    bdd
      .given('a node with a hasPart getter returning a different FrozenNodeSet after the first read', () => {
        let numCalls = 0;

        return {
          '@id': '_:thread',
          '@type': new Set(['Thread']),
          get hasPart() {
            return numCalls++ ? new FrozenNodeSet(['_:unvalidated']) : new Set([{ '@id': '_:m-1' }]);
          }
        };
      })
      .when('createDraftNode() is called', value => createDraftNode(value))
      .then('should store the validated hasPart', (_, node) =>
        expect(Array.from(getHasPartIds(node))).toEqual(['_:m-1'])
      );

    bdd
      .given('a node with an isPartOf getter returning a different FrozenNodeSet after the first read', () => {
        let numCalls = 0;

        return {
          '@id': '_:m-1',
          '@type': new Set(['Message']),
          get isPartOf() {
            return numCalls++ ? new FrozenNodeSet(['_:unvalidated']) : new Set([{ '@id': '_:thread' }]);
          }
        };
      })
      .when('createDraftNode() is called', value => createDraftNode(value))
      .then('should store the validated isPartOf', (_, node) =>
        expect(Array.from(getIsPartOfIds(node))).toEqual(['_:thread'])
      );
  },
  NodeTest
);

scenario(
  'createDraftNode with non-enumerable, accessor and inherited properties',
  bdd => {
    bdd
      .given('a node with a non-enumerable "name"', () =>
        Object.defineProperty({ '@id': '_:m-1', '@type': new Set(['Message']) }, 'name', { value: ['John Doe'] })
      )
      .when('createDraftNode() is called', value => createDraftNode(value))
      .then('JSON.parse(JSON.stringify()) should not have "name"', value =>
        expect(JSON.parse(JSON.stringify(value))).not.toHaveProperty('name')
      )
      .and('createDraftNode() should not have "name" as JSON.parse(JSON.stringify()) does', (_, node) =>
        expect(node).not.toHaveProperty('name')
      );

    bdd
      .given('a node with an enumerable "name" getter', () =>
        Object.defineProperty({ '@id': '_:m-1', '@type': new Set(['Message']) }, 'name', {
          enumerable: true,
          get: () => ['John Doe']
        })
      )
      .when('createDraftNode() is called', value => createDraftNode(value))
      .then('JSON.parse(JSON.stringify()) should have "name"', value =>
        expect(JSON.parse(JSON.stringify(value))).toHaveProperty('name', ['John Doe'])
      )
      .and('createDraftNode() should have "name" as JSON.parse(JSON.stringify()) does', (_, node) =>
        expect(Reflect.getOwnPropertyDescriptor(node, 'name')).toEqual({
          configurable: true,
          enumerable: true,
          value: ['John Doe'],
          writable: true
        })
      );

    bdd.given
      .oneOf<object>([
        [
          'a node with a non-enumerable "@id"',
          () => Object.defineProperty({ '@type': new Set(['Message']) }, '@id', { value: '_:m-1' })
        ],
        [
          'a node with an inherited "@id"',
          () => Object.assign(Object.create({ '@id': '_:m-1' }) as object, { '@type': new Set(['Message']) })
        ]
      ])
      .when('createDraftNode() is called', value => {
        try {
          return { value: createDraftNode(value) };
        } catch (error) {
          return { error };
        }
      })
      .then('JSON.parse(JSON.stringify()) should not have "@id"', value =>
        expect(JSON.parse(JSON.stringify(value))).not.toHaveProperty('@id')
      )
      .and('createDraftNode() should throw as "@id" is missing from JSON.parse(JSON.stringify())', (_, result) =>
        expect(result).toEqual({ error: expect.any(Error) })
      );

    bdd
      .given('a node with a non-enumerable "@type"', () =>
        Object.defineProperty({ '@id': '_:m-1' }, '@type', { value: new Set(['Message']) })
      )
      .when('createDraftNode() is called', value => {
        try {
          return { value: createDraftNode(value) };
        } catch (error) {
          return { error };
        }
      })
      .then('JSON.parse(JSON.stringify()) should not have "@type"', value =>
        expect(JSON.parse(JSON.stringify(value))).not.toHaveProperty('@type')
      )
      .and('createDraftNode() should throw as "@type" is missing from JSON.parse(JSON.stringify())', (_, result) =>
        expect(result).toEqual({ error: expect.any(Error) })
      );
  },
  NodeTest
);

scenario(
  'createDraftNode with null-prototype JSON literal',
  bdd => {
    bdd
      .given('a node with a JSON literal of a frozen null-prototype object', () => ({
        '@id': '_:m-1',
        '@type': new Set(['Message']),
        text: Object.freeze([
          Object.freeze({
            '@type': '@json',
            '@value': Object.freeze(Object.assign(Object.create(null) as Record<string, unknown>, { one: 1 }))
          })
        ])
      }))
      .when('@value is processed by both JSON.parse(JSON.stringify()) and createDraftNode()', value => {
        const [literal] = getProperty(createDraftNode(value), 'text') as readonly { readonly '@value': object }[];
        const [originalLiteral] = value.text;

        return {
          actual: Object.getPrototypeOf(literal?.['@value']),
          expected: Object.getPrototypeOf(JSON.parse(JSON.stringify(originalLiteral?.['@value'])))
        };
      })
      .then('JSON.parse(JSON.stringify()) should return a plain object', (_, { expected }) =>
        expect(expected).toBe(Object.prototype)
      )
      .and(
        'createDraftNode() should return a plain object as JSON.parse(JSON.stringify()) does',
        (_, { actual, expected }) => expect(actual).toBe(expected)
      );
  },
  NodeTest
);
