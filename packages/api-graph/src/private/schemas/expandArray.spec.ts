import { scenario } from '@testduet/given-when-then';
import expandArray from './expandArray';
import type { FlattenedNodeObject } from './FlattenedNodeObject';

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
        }) satisfies FlattenedNodeObject
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
});
