import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';

import colorNode from './colorNode';
import type { FlatNodeObject } from './FlatNodeObject';

scenario('colorNode corner cases', bdd => {
  bdd
    .given(
      'a recipe JSON-LD object with some property values of array',
      () =>
        ({
          '@id': '_:b1',
          '@type': ['Recipe'],
          name: 'Mojito',
          ingredient: [
            '12 fresh mint leaves',
            '1/2 lime, juiced with pulp',
            '1 tablespoons white sugar',
            '1 cup ice cubes',
            '2 fluid ounces white rum',
            '1/2 cup club soda'
          ],
          yield: '1 cocktail'
        }) satisfies FlatNodeObject
    )
    .when('expanded', value => colorNode(value))
    .then('should wrap property values in array', (_, actual) => {
      expect(actual).toEqual({
        '@id': '_:b1',
        '@type': ['Recipe'],
        name: ['Mojito'],
        ingredient: [
          '12 fresh mint leaves',
          '1/2 lime, juiced with pulp',
          '1 tablespoons white sugar',
          '1 cup ice cubes',
          '2 fluid ounces white rum',
          '1/2 cup club soda'
        ],
        yield: ['1 cocktail']
      });
    });

  bdd.given
    .oneOf<any>([
      [
        'a node with hasPart as an array of string',
        () => [
          { '@id': '_:b1', '@type': ['Conversation'], hasPart: ['Hello, World!'] },
          'NodeReference must only have @id and optional @type'
        ]
      ],
      [
        'a node with hasPart as a string',
        () => [
          { '@id': '_:b1', '@type': ['Conversation'], hasPart: 'Hello, World!' },
          'NodeReference must only have @id and optional @type'
        ]
      ],
      [
        'a node with isPartOf as an array of string',
        () => [
          { '@id': '_:b1', '@type': ['Conversation'], isPartOf: ['Hello, World!'] },
          'NodeReference must only have @id and optional @type'
        ]
      ],
      [
        'a node with isPartOf a string',
        () => [
          { '@id': '_:b1', '@type': ['Conversation'], isPartOf: 'Hello, World!' },
          'NodeReference must only have @id and optional @type'
        ]
      ]
    ])
    .when('colored', ([node]) => {
      try {
        colorNode(node);
      } catch (error) {
        return error;
      }

      return undefined;
    })
    .then('should throw', ([_, expectedMessage], error) => {
      expect(() => {
        throw error;
      }).toThrow(expectedMessage);
    });

  bdd
    .given(
      'a node with a property value mixed with literal and node reference',
      () =>
        ({
          '@id': '_:b1',
          '@type': ['Message'],
          text: ['Hello, World!', { '@id': '_:b2' }, 0, false]
        }) satisfies FlatNodeObject
    )
    .when('colored', node => colorNode(node))
    .then('should convert', (_, slantNode) => {
      expect(slantNode).toEqual({
        '@id': '_:b1',
        '@type': ['Message'],
        text: ['Hello, World!', { '@id': '_:b2' }, 0, false]
      });
    });

  bdd
    .given('a node with @id of non-IRIs', () => ({ '@id': 'abc' }))
    .when('colored', node => {
      try {
        colorNode(node as any);
      } catch (error) {
        return error;
      }

      return undefined;
    })
    .then('should throw', (_, error) => {
      expect(() => {
        throw error;
      }).toThrow('@id is required and must be an IRI or blank node identifier');
    });
});
