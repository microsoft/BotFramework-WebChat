import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import { array, assert, length, object, pipe } from 'valibot';

import blankNodeIdentifier from './BlankNodeIdentifier';
import './expectExtendValibot';
import flattenNodeObject from './flattenNodeObject';
import identifier from './Identifier';
import type { Literal } from './Literal';
import { nodeObject } from './NodeObject';
import { nodeReference } from './NodeReference';

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
      ],
      [
        'a simple non-JSON-LD object with a property with value of type "null"',
        () => [{ value: null }, { value: null }]
      ]
    ])
    .when('flattened', ([value]) => flattenNodeObject(value))
    .then('should return a node reference', (_, { output }) => {
      assert(nodeReference(), output);
      assert(blankNodeIdentifier(), output['@id']);
    })
    .and('should return a graph with one node object', (_, { graph }) => {
      assert(pipe(array(nodeObject()), length(1)), graph);
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
            '@id': expect.valibot(identifier()),
            description: 'The Empire State Building is a 102-story landmark in New York City.',
            geo: expect.valibot(nodeReference()),
            image: 'http://www.civil.usherbrooke.ca/cours/gci215a/empire-state-building.jpg',
            name: 'The Empire State Building'
          },
          {
            '@id': expect.valibot(identifier()),
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

      assert(object({ geo: nodeReference() }), rootObject);

      const geoObject = graph.find(object => object !== rootObject);

      assert(nodeObject(), geoObject);

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
});
