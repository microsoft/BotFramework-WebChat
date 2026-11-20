import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';

scenario(
  'assumption',
  bdd => {
    bdd
      .given('an object', () => Object.create({}, { abc: { value: 'value' } }) as { abc: string })
      .when('serializing the object', obj => JSON.parse(JSON.stringify(obj)))
      .then('should not return the property', (_, result) => {
        expect(result).toEqual({});
      });
  },
  NodeTest
);
