import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import { parse } from 'valibot';
import { jsonValueSchema } from './JSONValue.ts';

scenario(
  'jsonValueSchema',
  bdd => {
    bdd
      .given('a JSON object with value of undefined', () => ({ one: 1, two: undefined, three: 3 }))
      .when('parsed', target => parse(jsonValueSchema, target))
      .then('should remove undefined values', (_, result) => expect(result).toEqual({ one: 1, three: 3 }));

    bdd
      .given('a JSON array with value of undefined', () => [1, undefined, 3])
      .when('parsed', target => parse(jsonValueSchema, target))
      .then('should transform undefined into null', (_, result) => expect(result).toEqual([1, null, 3]));

    bdd.given
      .oneOf<unknown>([
        [
          'an object containing itself',
          () => {
            const value: { one: number; self?: unknown } = { one: 1 };

            value.self = value;

            return value;
          }
        ],
        [
          'an array containing itself',
          () => {
            const value: unknown[] = [1];

            value.push(value);

            return value;
          }
        ],
        [
          'an object containing itself deeply via an array',
          () => {
            const value: { items: unknown[] } = { items: [] };

            value.items.push({ parent: value });

            return value;
          }
        ],
        [
          'an object containing its ancestor',
          () => {
            const child: { three?: unknown } = {};
            const value = { one: { two: child } };

            child.three = value.one;

            return value;
          }
        ]
      ])
      .when('parsed', target => {
        try {
          return parse(jsonValueSchema, target);
        } catch (error) {
          return error;
        }
      })
      .then('should throw', (_, result) =>
        expect(result).toEqual(expect.objectContaining({ message: 'JSON value must not be recursive' }))
      )
      .and('should not be serializable by JSON.stringify()', target => expect(() => JSON.stringify(target)).toThrow());

    bdd
      .given('an object with the same object appearing twice but not recursive', () => {
        const shared = { value: 1 };

        return { one: shared, two: [shared, shared] };
      })
      .when('parsed', target => parse(jsonValueSchema, target))
      .then('should succeed', (target, result) => expect(result).toEqual(target))
      .and('should be serializable by JSON.stringify()', target =>
        expect(JSON.parse(JSON.stringify(target))).toEqual(target)
      );

    bdd.given
      .oneOf<unknown>([
        ['a Date', () => ({ date: new Date(0) })],
        ['an object with toJSON() returning a primitive', () => ({ value: { toJSON: () => 'Hello' } })],
        [
          'an object with toJSON() returning an object with toJSON()',
          () => ({ value: { toJSON: () => ({ nested: { toJSON: () => 1 } }) } })
        ],
        ['an array with toJSON() returning an array', () => [{ toJSON: () => [1, undefined] }]],
        ['a root value with toJSON()', () => ({ toJSON: () => ({ one: 1, two: undefined }) })],
        ['a class instance with toJSON() on prototype', () => [new URL('https://example.com/')]]
      ])
      .when('parsed', target => parse(jsonValueSchema, target))
      .then('should be same as JSON.stringify() then JSON.parse()', (target, result) =>
        expect(result).toEqual(JSON.parse(JSON.stringify(target)))
      );

    bdd
      .given('an object with toJSON() recording its key', () => {
        const keys: string[] = [];
        const record = {
          toJSON: (key: string) => {
            keys.push(key);

            return key;
          }
        };

        return { keys, target: { one: record, two: [record] } };
      })
      .when('parsed', ({ target }) => parse(jsonValueSchema, target))
      .then('should call toJSON() with the key', ({ keys }) => expect(keys).toEqual(['one', '0']))
      .and('should use the returned value', (_, result) => expect(result).toEqual({ one: 'one', two: ['0'] }));

    bdd
      .given('a toJSON() returning its ancestor', () => {
        const value: { child?: unknown } = {};

        value.child = { toJSON: () => value };

        return value;
      })
      .when('parsed', target => {
        try {
          return parse(jsonValueSchema, target);
        } catch (error) {
          return error;
        }
      })
      .then('should throw', (_, result) =>
        expect(result).toEqual(expect.objectContaining({ message: 'JSON value must not be recursive' }))
      )
      .and('should not be serializable by JSON.stringify()', target => expect(() => JSON.stringify(target)).toThrow());

    bdd
      .given('a toJSON() returning a function', () => ({ value: { toJSON: () => () => 1 } }))
      .when('parsed', target => {
        try {
          return parse(jsonValueSchema, target);
        } catch (error) {
          return error;
        }
      })
      .then('should throw as function is not a JSON value', (_, result) => expect(result).toEqual(expect.any(Error)));

    bdd
      .given('a frozen object without toJSON()', () => Object.freeze({ one: Object.freeze([1]) }))
      .when('parsed', target => parse(jsonValueSchema, target))
      .then('should not modify the input', (target, result) => {
        expect(result).toEqual({ one: [1] });
        expect(Object.isFrozen(target)).toBe(true);
      });
  },
  NodeTest
);

scenario(
  'Assumptions',
  bdd => {
    bdd
      .given('a JSON object with value of undefined', () => ({ one: 1, two: undefined, three: 3 }))
      .when('stringified then parsed', target => JSON.parse(JSON.stringify(target)))
      .then('should remove undefined values', (_, result) => expect(result).toEqual({ one: 1, three: 3 }));

    bdd
      .given('a JSON array with value of undefined', () => [1, undefined, 3])
      .when('stringified then parsed', target => JSON.parse(JSON.stringify(target)))
      .then('should transform undefined into null', (_, result) => expect(result).toEqual([1, null, 3]));
  },
  NodeTest
);
