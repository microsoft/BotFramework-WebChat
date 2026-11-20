import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';

scenario(
  'assumption',
  bdd => {
    bdd.given
      .oneOf([
        [
          'an object with non-enumerable getter',
          () => Object.create({}, { value: { get: () => 'Hello, World!' } }) as { value: string }
        ],
        [
          'an object with non-enumerable value',
          () => Object.create({}, { value: { value: 'Hello, World!' } }) as { value: string }
        ]
      ])
      .when('serializing the object', obj => JSON.parse(JSON.stringify(obj)))
      .then('should not return the property', (_, result) => {
        expect(result).toEqual({});
      });

    bdd.given
      .oneOf([
        [
          'an object with enumerable getter',
          () => Object.create({}, { value: { enumerable: true, get: () => 'Hello, World!' } }) as { value: string }
        ],
        [
          'an object with enumerable value',
          () => Object.create({}, { value: { enumerable: true, value: 'Hello, World!' } }) as { value: string }
        ]
      ])
      .when('serializing the object', obj => JSON.parse(JSON.stringify(obj)))
      .then('should return the property', (_, result) => {
        expect(result).toEqual({ value: 'Hello, World!' });
      });
  },
  NodeTest
);
