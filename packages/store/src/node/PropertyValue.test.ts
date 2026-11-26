import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import { safeParse } from 'valibot';
import { propertyValueSchema } from './PropertyValue.ts';

scenario(
  'propertyValueSchema',
  bdd => {
    bdd.given
      .oneOf<unknown[]>([
        ['an array of string', () => ['Hello, World!']],
        ['an array of boolean, number, and string', () => [true, 0, -1.5, Infinity, '']],
        ['an array of node references', () => [{ '@id': '_:m-1' }, { '@id': 'https://example.com/m-1' }]],
        ['an array of JSON literal', () => [{ '@type': '@json', '@value': { one: 1, two: [2] } }]],
        ['an array of JSON literal of null', () => [{ '@type': '@json', '@value': null }]]
      ])
      .when('parsed', value => safeParse(propertyValueSchema, value))
      .then('should succeed', (_, result) => expect(result.success).toBe(true))
      .and('should return an equal but new array', (value, result) => {
        expect(result.output).toEqual(value);
        expect(result.output).not.toBe(value);
      });

    bdd
      .given('a node reference and a JSON literal', () =>
        Object.freeze({ jsonLiteral: { '@type': '@json', '@value': { one: 1 } }, nodeReference: { '@id': '_:m-1' } })
      )
      .when('parsed in an array', ({ jsonLiteral, nodeReference }) =>
        safeParse(propertyValueSchema, [nodeReference, jsonLiteral])
      )
      .then('should succeed', (_, result) => expect(result.success).toBe(true))
      .and('should copy the node reference', ({ nodeReference }, result) =>
        expect(result.success && result.output[0]).not.toBe(nodeReference)
      )
      .and('should copy the JSON literal', ({ jsonLiteral }, result) =>
        expect(result.success && result.output[1]).not.toBe(jsonLiteral)
      );

    bdd
      .given('an array of JSON literal with Date and dangerous key', () => [
        {
          '@type': '@json',
          '@value': Object.assign(JSON.parse('{"__proto__":{"polluted":true}}'), { date: new Date(0) })
        }
      ])
      .when('parsed', value => safeParse(propertyValueSchema, value))
      .then('should convert @value as JSON', (_, result) =>
        expect(result.output).toEqual([{ '@type': '@json', '@value': { date: '1970-01-01T00:00:00.000Z' } }])
      );

    bdd.given
      .oneOf<unknown>([
        ['not an array', () => 'Hello, World!'],
        ['an array of null', () => [null]],
        ['an array of undefined', () => [undefined]],
        ['an array of NaN', () => [NaN]],
        ['an array of nested array', () => [['Hello, World!']]],
        ['an array of an object', () => [{ text: 'Hello, World!' }]],
        ['an array of node reference with excess property', () => [{ '@id': '_:m-1', text: 'Hello, World!' }]],
        ['an array of node reference with invalid @id', () => [{ '@id': 'm-1' }]],
        ['an array of JSON literal without @value', () => [{ '@type': '@json' }]],
        ['an array of JSON literal with wrong @type', () => [{ '@type': 'json', '@value': 1 }]],
        ['an array of JSON literal with excess property', () => [{ '@type': '@json', '@value': 1, text: '' }]],
        ['an array of valid and invalid values', () => ['Hello, World!', null]]
      ])
      .when('parsed', value => safeParse(propertyValueSchema, value))
      .then('should fail', (_, result) => expect(result.success).toBe(false))
      .and('should have the error message', (_, result) =>
        expect(result.issues?.map(({ message }) => message)).toEqual([
          'Property value must be array of boolean, number, string, node reference, or JSON literal'
        ])
      );

    bdd
      .given('an empty array', () => [])
      .when('parsed', value => safeParse(propertyValueSchema, value))
      .then('should fail', (_, result) => expect(result.success).toBe(false))
      .and('should have the error message', (_, result) =>
        expect(result.issues?.map(({ message }) => message)).toEqual(['Property must have at least one value'])
      );

    bdd
      .given('an array of 2 invalid values', () => [null, NaN])
      .when('parsed', value => safeParse(propertyValueSchema, value))
      .then('should report all issues', (_, result) => expect(result.issues).toHaveLength(2));

    bdd
      .given('an array of JSON literal with BigInt', () => [{ '@type': '@json', '@value': 1n }])
      .when('parsed', value => safeParse(propertyValueSchema, value))
      .then('should fail', (_, result) => expect(result.success).toBe(false))
      .and('should have the error message from JSON value', (_, result) =>
        expect(result.issues?.map(({ message }) => message)).toEqual(['JSON value must not contain BigInt'])
      );
  },
  NodeTest
);
