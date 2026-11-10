import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import { safeParse } from 'valibot';
import { identifierSchema } from './NodeIdentifier.ts';

scenario(
  'identifierSchema',
  bdd => {
    bdd.given
      .oneOf([
        ['a blank node identifier', () => '_:m-1'],
        ['an IRI', () => 'https://example.com/m-1']
      ])
      .when('parsed', value => safeParse(identifierSchema, value))
      .then('should succeed', (_, result) => expect(result.success).toBe(true))
      .and('should return the identifier as-is', (value, result) => expect(result.output).toBe(value));

    bdd.given
      .oneOf<unknown>([
        ['a number', () => 1],
        ['undefined', () => undefined],
        ['a node reference', () => ({ '@id': '_:m-1' })],
        ['a string without prefix', () => 'm-1'],
        ['an HTTP IRI', () => 'http://example.com/m-1'],
        ['an IRI without host', () => 'https://'],
        ['an invalid IRI', () => 'https://example .com/']
      ])
      .when('parsed', value => safeParse(identifierSchema, value))
      .then('should fail', (_, result) => expect(result.success).toBe(false))
      .and('should have the error message', (_, result) =>
        expect(result.issues?.map(({ message }) => message)).toEqual([
          '@id is required and must be an IRI or blank node identifier'
        ])
      );
  },
  NodeTest
);
