import { scenario } from '@testduet/given-when-then';

import expandArray from './expandArray';
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
    .when('expanded', value => expandArray(value))
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
    .when('expanded', value => expandArray(value))
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
    .when('expanded', value => expandArray(value))
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
    .when('expnaded', value => expandArray(value))
    .then('should return both types', (_, actual) => {
      expect(actual['@type']).toEqual(['HowTo', 'Message']);
    });
});
