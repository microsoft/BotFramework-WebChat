import { scenario } from '@testduet/given-when-then';
import toJSONValue from './toJSONValue';

/* eslint-disable no-restricted-globals */

scenario('JSON projection of a value', bdd => {
  bdd
    .given('a JSON value', () => ({ list: [1, 'two', true, null], nested: { text: 'Hello' } }))
    .when('projected', value => toJSONValue(value))
    .then('should equal the value', (value, actual) => expect(actual).toEqual(value))
    .and('should be a copy', (value, actual) => expect(actual).not.toBe(value))
    .and('should be deeply frozen (the store reuses it)', (_, actual: any) => {
      expect(Object.isFrozen(actual)).toBe(true);
      expect(Object.isFrozen(actual.list)).toBe(true);
      expect(Object.isFrozen(actual.nested)).toBe(true);
    });

  bdd
    .given('a value with a `Date`', () => ({ timestamp: new Date(123) }))
    .when('projected', value => toJSONValue(value))
    .then('should hold the ISO string, as `JSON.stringify()`', (_, actual) =>
      expect(actual).toEqual({ timestamp: '1970-01-01T00:00:00.123Z' })
    );

  bdd
    .given('a value with a `Map` and a class instance', () => {
      class Point {
        x = 1;
        y = 2;
      }

      return { map: new Map([['a', 1]]), point: new Point() };
    })
    .when('projected', value => toJSONValue(value))
    .then('should hold plain objects of their own enumerable properties, as `JSON.stringify()`', (_, actual) => {
      expect(actual).toEqual({ map: {}, point: { x: 1, y: 2 } });
      expect(Object.getPrototypeOf((actual as any).point)).toBe(Object.prototype);
    });
});
