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

    bdd
      .given('a primitive value', () => 'Hello')
      .when('deepFreeze() is called', value => deepFreeze(value, value))
      .then('should return the value as-is', (value, result) => expect(result).toBe(value));
  },
  NodeTest
);
