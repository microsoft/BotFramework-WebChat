import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import createReadonlySet from '../structure/createReadonlySet.ts';
import deepFreeze from './deepFreeze.ts';

scenario(
  'deepFreeze',
  bdd => {
    bdd
      .given('a deeply frozen value which is the same as the validated value', () =>
        Object.freeze({ items: Object.freeze([1, Object.freeze({ two: 2 })]), name: 'Hello' })
      )
      .when('deepFreeze() is called', value => deepFreeze(value, value))
      .then('should return the value as-is', (value, result) => expect(result).toBe(value));

    bdd
      .given('a deeply frozen value and a validated copy', () => {
        const value = Object.freeze({ items: Object.freeze([1, 2]) });

        return { copy: { items: [1, 2] }, value };
      })
      .when('deepFreeze() is called', ({ copy, value }) => deepFreeze(value, copy))
      .then('should return the original value as-is', ({ value }, result) => expect(result).toBe(value));

    bdd
      .given('a shallowly frozen value', () => Object.freeze({ items: [1, 2] }))
      .when('deepFreeze() is called', value => deepFreeze(value, value))
      .then('should return a copy', (value, result) => {
        expect(result).not.toBe(value);
        expect(result).toEqual(value);
      })
      .and('should deeply freeze the copy', (_, result) => {
        expect(Object.isFrozen(result)).toBe(true);
        expect(Object.isFrozen(result.items)).toBe(true);
      });

    bdd
      .given('a deeply frozen value which is different from the validated value', () =>
        Object.freeze({ items: Object.freeze([1, 2]), name: 'Hello' })
      )
      .when('deepFreeze() is called with a validated value with fewer properties', value =>
        deepFreeze(value, { items: [1, 2] })
      )
      .then('should return a copy of the validated value', (_, result) => expect(result).toEqual({ items: [1, 2] }))
      .and('should reuse the unchanged deeply frozen part', (value, result) => expect(result.items).toBe(value.items));

    bdd
      .given('a read-only Set', () => createReadonlySet(['one', 'two']))
      .when('deepFreeze() is called with a validated copy', value => deepFreeze(value, new Set(value)))
      .then('should return the read-only Set as-is', (value, result) => expect(result).toBe(value));

    bdd
      .given('a frozen mutable Set', () => Object.freeze(new Set(['one'])))
      .when('deepFreeze() is called', value => deepFreeze(value, value))
      .then('should return a read-only Set copy', (value, result) => {
        expect(result).not.toBe(value);
        expect(() => (result as Set<string>).add('two')).toThrow(TypeError);
      });

    bdd.given
      .oneOf([
        ['"__proto__"', () => JSON.parse('{"__proto__":{"polluted":true},"name":"Hello"}')],
        ['"constructor"', () => JSON.parse('{"constructor":{"polluted":true},"name":"Hello"}')],
        ['"prototype"', () => JSON.parse('{"prototype":{"polluted":true},"name":"Hello"}')]
      ])
      .when('deepFreeze() is called', value => deepFreeze(undefined, value))
      .then('should skip the dangerous property', (_, result) => {
        expect(Object.keys(result)).toEqual(['name']);
        expect(Object.getOwnPropertyNames(result)).toEqual(['name']);
      })
      .and('should be a plain object', (_, result) => {
        expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
        expect(result).not.toHaveProperty('polluted');
      })
      .and('should be frozen', (_, result) => expect(Object.isFrozen(result)).toBe(true));

    bdd
      .given('a deeply frozen object with own "__proto__" property', () =>
        Object.freeze(
          Object.defineProperty({ name: 'Hello' }, '__proto__', { enumerable: true, value: Object.freeze({}) })
        )
      )
      .when('deepFreeze() is called', value => deepFreeze(value, value))
      .then('should not reuse the original value', (value, result) => expect(result).not.toBe(value))
      .and('should skip the dangerous property', (_, result) => expect(result).toEqual({ name: 'Hello' }));

    bdd
      .given('an array of objects with dangerous properties nested', () =>
        JSON.parse('[{"inner":{"__proto__":{"polluted":true},"value":1}}]')
      )
      .when('deepFreeze() is called', value => deepFreeze(undefined, value))
      .then('should skip the nested dangerous property', (_, result) =>
        expect(result).toEqual([{ inner: { value: 1 } }])
      )
      .and('should not pollute Object.prototype', () => expect({}).not.toHaveProperty('polluted'));

    bdd
      .given('an object with the same object appearing twice but not recursive', () => {
        const shared = { value: 1 };

        return { array: [shared, shared], one: shared, two: shared };
      })
      .when('deepFreeze() is called', value => deepFreeze(undefined, value))
      .then('should copy every occurrence', (_, result) =>
        expect(result).toEqual({ array: [{ value: 1 }, { value: 1 }], one: { value: 1 }, two: { value: 1 } })
      )
      .and('should deeply freeze every occurrence', (_, result) => {
        expect(Object.isFrozen(result.one)).toBe(true);
        expect(Object.isFrozen(result.two)).toBe(true);
        expect(Object.isFrozen(result.array[0])).toBe(true);
        expect(Object.isFrozen(result.array[1])).toBe(true);
      });

    bdd
      .given('a sparse array', () => {
        const array: number[] = [];

        array[0] = 1;
        array[2] = 3;

        return array;
      })
      .when('deepFreeze() is called', value => deepFreeze(undefined, value))
      .then('should return a dense frozen copy', (_, result) => {
        expect(result).toEqual([1, undefined, 3]);
        expect(Object.keys(result)).toEqual(['0', '1', '2']);
        expect(Object.isFrozen(result)).toBe(true);
      });

    bdd
      .given('a primitive value', () => 'Hello')
      .when('deepFreeze() is called', value => deepFreeze(value, value))
      .then('should return the value as-is', (value, result) => expect(result).toBe(value));
  },
  NodeTest
);
