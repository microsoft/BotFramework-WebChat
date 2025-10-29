import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';

import colorNode from './colorNode';
import type { FlatNodeObject } from './FlatNodeObject';

scenario('expandArray', bdd => {
  bdd
    .given(
      'a JSON-LD object with @context, @id, and @type',
      () =>
        ({
          '@context': 'http://schema.org/',
          '@id': '_:b1',
          '@type': 'Person',
          name: 'Jane Doe',
          jobTitle: 'Professor',
          telephone: '(425) 123-4567',
          url: 'http://www.janedoe.com'
        }) satisfies FlatNodeObject
    )
    .when('expanded', value => colorNode(value))
    .then('should wrap @type and property values in array', (_, actual) => {
      expect(actual).toEqual({
        '@context': 'http://schema.org/',
        '@id': '_:b1',
        '@type': ['Person'],
        name: ['Jane Doe'],
        jobTitle: ['Professor'],
        telephone: ['(425) 123-4567'],
        url: ['http://www.janedoe.com']
      });
    });

  bdd
    .given(
      'a JSON-LD object without @context, @id, and @type',
      () =>
        ({
          '@id': '_:b1',
          name: 'Jane Doe',
          jobTitle: 'Professor',
          telephone: '(425) 123-4567',
          url: 'http://www.janedoe.com'
        }) satisfies FlatNodeObject
    )
    .when('expanded', value => colorNode(value))
    .then('should wrap @type and property values in array', (_, actual) => {
      expect(actual).toEqual({
        '@id': '_:b1',
        name: ['Jane Doe'],
        jobTitle: ['Professor'],
        telephone: ['(425) 123-4567'],
        url: ['http://www.janedoe.com']
      });
    });

  bdd
    .given(
      'a recipe JSON-LD object with some property values of array',
      () =>
        ({
          '@id': '_:b1',
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

  bdd
    .given(
      'a JSON-LD object with @type of type array',
      () =>
        ({
          '@id': '_:b1',
          '@type': ['HowTo', 'Message']
        }) satisfies FlatNodeObject
    )
    .when('expnaded', value => colorNode(value))
    .then('should return both types', (_, actual) => {
      expect(actual['@type']).toEqual(['HowTo', 'Message']);
    });

  bdd.given
    .oneOf<any>([
      [
        'a node with hasPart as an array of string',
        () => [{ '@id': '_:b1', hasPart: ['Hello, World!'] }, 'element in hasPart must be NodeReference']
      ],
      [
        'a node with hasPart as a string',
        () => [{ '@id': '_:b1', hasPart: 'Hello, World!' }, 'element in hasPart must be NodeReference']
      ],
      [
        'a node with isPartOf as an array of string',
        () => [{ '@id': '_:b1', isPartOf: ['Hello, World!'] }, 'element in isPartOf must be NodeReference']
      ],
      [
        'a node with isPartOf a string',
        () => [{ '@id': '_:b1', isPartOf: 'Hello, World!' }, 'element in isPartOf must be NodeReference']
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

  bdd.given
    .oneOf<FlatNodeObject>([
      ['a node with a property value of null', () => ({ '@id': '_:b1', value: null })],
      ['a node with a property value of empty array', () => ({ '@id': '_:b1', value: [] })]
    ])
    .when('colored', node => colorNode(node))
    .then('the property should be removed', (_, slantNode) => {
      expect(slantNode).toEqual({ '@id': '_:b1' });
    });

  bdd.given
    .oneOf<FlatNodeObject>([
      ['a node with hasPart of empty array', () => ({ '@id': '_:b1', hasPart: [] })],
      ['a node with isPartOf of empty array', () => ({ '@id': '_:b1', isPartOf: [] })]
    ])
    .when('colored', node => colorNode(node))
    .then('the property should be removed', (_, slantNode) => {
      expect(slantNode).toEqual({ '@id': '_:b1' });
    });

  bdd
    .given(
      'a node with a property value mixed with literal and node reference',
      () =>
        ({
          '@id': '_:b1',
          value: ['Hello, World!', { '@id': '_:b2' }, 0, false]
        }) satisfies FlatNodeObject
    )
    .when('colored', node => colorNode(node))
    .then('should convert', (_, slantNode) => {
      expect(slantNode).toEqual({
        '@id': '_:b1',
        value: ['Hello, World!', { '@id': '_:b2' }, 0, false]
      });
    });
});
