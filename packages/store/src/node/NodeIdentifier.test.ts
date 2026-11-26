import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import { safeParse } from 'valibot';
import { identifierSchema } from './NodeIdentifier.ts';

type URLStatics = { readonly canParse: typeof URL.canParse; readonly parse: typeof URL.parse };

type Environment = readonly [
  string,
  () => URLStatics | undefined,
  ((statics: URLStatics | undefined) => void) | undefined
];

scenario(
  'identifierSchema',
  bdd => {
    const environments: readonly Environment[] = [
      ['URL.parse() and URL.canParse() are supported', () => undefined, undefined],
      [
        'URL.parse() and URL.canParse() are not supported',
        (): URLStatics => {
          const { canParse, parse } = URL;

          Object.defineProperties(URL, {
            canParse: { configurable: true, value: undefined, writable: true },
            parse: { configurable: true, value: undefined, writable: true }
          });

          return Object.freeze({ canParse, parse });
        },
        statics => {
          statics &&
            Object.defineProperties(URL, {
              canParse: { configurable: true, value: statics.canParse, writable: true },
              parse: { configurable: true, value: statics.parse, writable: true }
            });
        }
      ]
    ];

    bdd.given
      .oneOf<URLStatics | undefined>(environments)
      .and.oneOf([
        ['a blank node identifier', () => '_:m-1'],
        ['an IRI of https://', () => 'https://example.com/m-1'],
        ['an IRI of urn:', () => 'urn:com:example:m-1']
      ])
      .when('parsed', value => safeParse(identifierSchema, value))
      .then('should succeed', (_, result) => expect(result.success).toBe(true))
      .and('should return the identifier as-is', (value, result) => expect(result.output).toBe(value));

    bdd.given
      .oneOf<URLStatics | undefined>(environments)
      .and.oneOf<unknown>([
        ['a number', () => 1],
        ['undefined', () => undefined],
        ['a node reference', () => ({ '@id': '_:m-1' })],
        ['a string without prefix', () => 'm-1'],
        ['an HTTP IRI', () => 'http://example.com/m-1'],
        ['an IRI without host', () => 'https://'],
        ['an invalid IRI', () => 'https://example .com/'],
        ['an URN without path', () => 'urn:']
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
