import { afterEach, beforeEach, expect, jest } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import { array, assert, length, object, pipe } from 'valibot';

import { BlankNodeIdentifierSchema } from './BlankNodeIdentifier';
import { FlatNodeObjectSchema } from './FlatNodeObject';
import flattenNodeObject from './flattenNodeObject';
import { IdentifierSchema } from './Identifier';
import type { Literal } from './Literal';
import { NodeReferenceSchema } from './NodeReference';
import './private/expectExtendValibot';

beforeEach(() => {
  jest.spyOn(console, 'error');
  jest.spyOn(console, 'warn');
});

afterEach(() => {
  expect(console.error).not.toHaveBeenCalled();
  expect(console.warn).not.toHaveBeenCalled();
});

scenario('flattenNodeObject()', bdd => {
  bdd.given
    .oneOf<readonly [{ value: Literal }, { value: Literal }]>([
      [
        'a simple non-JSON-LD object with a property with value of type "number"',
        () => [{ value: 123 }, { value: 123 }]
      ],
      [
        'a simple non-JSON-LD object with a property with value of type "string"',
        () => [{ value: 'abc' }, { value: 'abc' }]
      ],
      [
        'a simple non-JSON-LD object with a property with value of type "boolean"',
        () => [{ value: true }, { value: true }]
      ]
    ])
    .when('flattened', ([value]) => flattenNodeObject(value))
    .then('should return a node reference', (_, { output }) => {
      assert(NodeReferenceSchema, output);
      assert(BlankNodeIdentifierSchema, output['@id']);
    })
    .and('should return a graph with one node object', (_, { graph }) => {
      assert(pipe(array(FlatNodeObjectSchema), length(1)), graph);
    })
    .and('should return a graph with the node object', ([_, expected], { graph, output }) => {
      expect(graph).toEqual([{ ...expected, '@id': output['@id'] }]);
    });

  bdd
    .given('a simple JSON-LD object with `@id` of `_:v1`', () => ({ '@id': '_:v1', value: 123 }))
    .when('flattened', value => flattenNodeObject(value))
    .then('should return a node reference with `@id` of `_:v1`', (_, { output }) => {
      expect(output).toEqual({ '@id': '_:v1' });
    })
    .and('should return a graph with the node object with `@id` of `_:v1`', (_, { graph }) => {
      expect(graph).toEqual([{ '@id': '_:v1', value: 123 }]);
    });

  bdd
    .given('an object with a child object', () => ({
      description: 'The Empire State Building is a 102-story landmark in New York City.',
      geo: {
        latitude: '40.75',
        longitude: '73.98'
      },
      image: 'http://www.civil.usherbrooke.ca/cours/gci215a/empire-state-building.jpg',
      name: 'The Empire State Building'
    }))
    .when('flattened', value => flattenNodeObject(value))
    .then(
      'should return a graph with 2 node objects and all property values are encapsulated in array',
      (_, { graph }) => {
        expect(graph).toEqual([
          {
            '@id': expect.valibot(IdentifierSchema),
            description: 'The Empire State Building is a 102-story landmark in New York City.',
            geo: expect.valibot(NodeReferenceSchema),
            image: 'http://www.civil.usherbrooke.ca/cours/gci215a/empire-state-building.jpg',
            name: 'The Empire State Building'
          },
          {
            '@id': expect.valibot(IdentifierSchema),
            latitude: '40.75',
            longitude: '73.98'
          }
        ]);
      }
    )
    .and('the first object must be the root object', (_, { output, graph }) => {
      expect(graph[0]?.['@id']).toBe(output['@id']);
    })
    .and('the root object should reference the geo object', (_, { output, graph }) => {
      const rootObject = graph.find(object => object['@id'] === output['@id']);

      assert(object({ geo: NodeReferenceSchema }), rootObject);

      const geoObject = graph.find(object => object !== rootObject);

      assert(FlatNodeObjectSchema, geoObject);

      expect(rootObject.geo['@id']).toBe(geoObject['@id']);
    });

  bdd.given
    .oneOf([
      ['a string', () => 'abc'], // Literal cannot be flattened, only object is allowed.
      ['an array of string', () => ['abc'] as any], // Array cannot be flattened, only object is allowed.
      ['a MessageChannel object', () => new MessageChannel()], // Complex object cannot be flattened, only plain object is allowed.
      ['an undefined value', () => undefined] // Undefined cannot be flattened, only null is allowed.
    ])
    .when('catching exception from the call', (value): any => {
      try {
        flattenNodeObject(value as any);
      } catch (error) {
        return error;
      }
    })
    .then('should throw', (_, error) => expect(error).toBeTruthy());

  bdd
    .given(`an object with an array mixed of JSON literal and plain object`, () => ({
      description: 'The Empire State Building is a 102-story landmark in New York City.',
      geo: [
        {
          '@type': '@json',
          '@value': {
            latitude: '40.75',
            longitude: '73.98'
          }
        },
        {
          city: 'New York',
          state: 'NY',
          street: '20 West 34th Street',
          zipCode: '10118'
        }
      ],
      image: 'http://www.civil.usherbrooke.ca/cours/gci215a/empire-state-building.jpg',
      name: 'The Empire State Building'
    }))
    .when('flattened', value => flattenNodeObject(value))
    .then('should return a graph with 1 node object', (_, { graph }) => {
      expect(graph).toEqual([
        {
          '@id': expect.valibot(IdentifierSchema),
          description: 'The Empire State Building is a 102-story landmark in New York City.',
          // "geo" property should kept as-is.
          geo: [
            {
              '@type': '@json',
              '@value': {
                latitude: '40.75',
                longitude: '73.98'
              }
            },
            expect.valibot(NodeReferenceSchema)
          ],
          image: 'http://www.civil.usherbrooke.ca/cours/gci215a/empire-state-building.jpg',
          name: 'The Empire State Building'
        },
        {
          '@id': expect.valibot(IdentifierSchema),
          city: 'New York',
          state: 'NY',
          street: '20 West 34th Street',
          zipCode: '10118'
        }
      ]);
    });

  bdd
    .given(`a class object with @type of '@json'`, () => ({
      '@id': '_:b1',
      value: {
        '@type': '@json',
        '@value': Symbol()
      }
    }))
    .when('flattened', value => {
      try {
        flattenNodeObject(value);
      } catch (error) {
        return error;
      }

      return undefined;
    })
    .then('should throw', (_, error) => {
      expect(() => {
        if (error) {
          throw error;
        }
      }).toThrow('Only literals, JSON literals, and plain object can be flattened');
    });
});

scenario('Reduce confusion: node reference must not appear at the root of the flattened graph', bdd => {
  bdd
    .given(
      'a node with @id and @type only',
      () =>
        ({
          '@id': '_:c1',
          '@type': 'Conversation'
        }) as const
    )
    .when('colored', node => {
      try {
        flattenNodeObject(node);
      } catch (error) {
        return error;
      }

      return undefined;
    })
    .then('should throw', (_, error) => {
      expect(() => {
        if (error) {
          throw error;
        }
      }).toThrow('Node reference cannot be flattened');
    });
});
