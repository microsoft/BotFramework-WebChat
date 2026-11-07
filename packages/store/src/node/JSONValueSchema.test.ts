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
        ['a Date', () => new Date(0)],
        ['a Map', () => new Map([['one', 1]])],
        ['a Set', () => new Set([1])],
        ['a URL', () => new URL('https://example.com/')],
        ['a class instance', () => new (class {})()],
        ['an object with toJSON()', () => ({ toJSON: () => 'Hello' })],
        ['a Date nested in an object', () => ({ date: new Date(0) })],
        ['a Map nested in an array', () => [new Map()]],
        ['a function', () => () => 1]
      ])
      .when('parsed', target => {
        try {
          return parse(jsonValueSchema, target);
        } catch (error) {
          return error;
        }
      })
      .then('should throw', (_, result) => expect(result).toEqual(expect.any(Error)));

    bdd
      .given('an object without prototype', () => Object.assign(Object.create(null), { one: 1 }))
      .when('parsed', target => parse(jsonValueSchema, target))
      .then('should succeed', (_, result) => expect(result).toEqual({ one: 1 }));

    bdd
      .given('a frozen object', () => Object.freeze({ one: Object.freeze([1]), two: undefined }))
      .when('parsed', target => parse(jsonValueSchema, target))
      .then('should remove undefined values without modifying the input', (target, result) => {
        expect(result).toEqual({ one: [1] });
        expect(Object.isFrozen(target)).toBe(true);
        expect(target).toHaveProperty('two', undefined);
      });

    bdd
      .given('a sparse array', () => {
        const value: number[] = [];

        value[0] = 1;
        value[2] = 3;

        return value;
      })
      .when('parsed', target => parse(jsonValueSchema, target))
      .then('should transform holes into null', (_, result) => {
        expect(result).toEqual([1, null, 3]);
        expect(Object.keys(result as object)).toEqual(['0', '1', '2']);
      });

    bdd
      .given('a deeply nested value with undefined', () => {
        const unchanged = { four: [4] };

        return { unchanged, value: { one: [{ two: undefined, three: 3 }, undefined], unchanged } };
      })
      .when('parsed', ({ value }) => parse(jsonValueSchema, value))
      .then('should normalize undefined deeply', (_, result) =>
        expect(result).toEqual({ one: [{ three: 3 }, null], unchanged: { four: [4] } })
      )
      .and('should reuse unchanged parts', ({ unchanged }, result) =>
        expect(Reflect.get(result as object, 'unchanged')).toBe(unchanged)
      )
      .and('should not modify the input', ({ value }) =>
        expect(value.one).toEqual([{ two: undefined, three: 3 }, undefined])
      );

    bdd
      .given('a JSON value without undefined', () => ({ one: [1, { two: 'two' }], three: null }))
      .when('parsed', target => parse(jsonValueSchema, target))
      .then('should return the value as-is', (target, result) => expect(result).toBe(target));

    bdd
      .given('an object with dangerous keys', () => JSON.parse('{"__proto__":{"polluted":true},"one":1}'))
      .when('parsed', target => parse(jsonValueSchema, target))
      .then('should remove dangerous keys', (_, result) => {
        expect(Object.keys(result as object)).toEqual(['one']);
        expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
      });

    bdd.given
      .oneOf<unknown>([
        ['undefined', () => undefined],
        ['NaN', () => NaN],
        ['Infinity', () => Infinity],
        ['a NaN nested in an array', () => [NaN]],
        ['a symbol', () => Symbol('one')],
        ['a bigint', () => BigInt(1)],
        ['a function nested in an object', () => ({ one: () => 1 })]
      ])
      .when('parsed', target => {
        try {
          return parse(jsonValueSchema, target);
        } catch (error) {
          return error;
        }
      })
      .then('should throw', (_, result) =>
        expect(result).toEqual(
          expect.objectContaining({
            message: 'Only boolean, null, number, string, array, and plain object is allowed for JSON value'
          })
        )
      );
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
