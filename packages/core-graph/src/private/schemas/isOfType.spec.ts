import { scenario } from '@testduet/given-when-then';
import type { FlatNodeObject } from './FlatNodeObject';
import isOfType from './isOfType';

scenario('isOfType', bdd => {
  bdd
    .given('@type of string', () => ({ '@id': '_:b1', '@type': 'Message' }) satisfies FlatNodeObject)
    .when.oneOf([
      ['isOfType() is called with "Message"', value => [isOfType(value, 'Message'), true]],
      ['isOfType() is called with "HowTo"', value => [isOfType(value, 'HowTo'), false]]
    ])
    .then('should return expected value', (_, [actual, expected]) => {
      expect(actual).toBe(expected);
    });

  bdd
    .given('@type of string', () => ({ '@id': '_:b1', '@type': ['HowTo', 'Message'] }) satisfies FlatNodeObject)
    .when.oneOf([
      ['isOfType() is called with "Message"', value => [isOfType(value, 'Message'), true]],
      ['isOfType() is called with "HowTo"', value => [isOfType(value, 'HowTo'), true]],
      ['isOfType() is called with "Person"', value => [isOfType(value, 'Person'), false]]
    ])
    .then('should return expected value', (_, [actual, expected]) => {
      expect(actual).toBe(expected);
    });

  bdd
    .given('object without @type', () => ({ '@id': '_:b1' }) satisfies FlatNodeObject)
    .when('isOfType() is called with "Message"', value => [isOfType(value, 'Message'), false])
    .then('should return expected false', (_, [actual, expected]) => {
      expect(actual).toBe(expected);
    });
});
