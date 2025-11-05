import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import { parse } from 'valibot';
import jsonValueSchema from './jsonValueSchema';

scenario('jsonValueSchema', bdd => {
  bdd
    .given('a JSON object with value of undefined', () => ({ one: 1, two: undefined, three: 3 }))
    .when('parsed', target => parse(jsonValueSchema, target))
    .then('should remove undefined values', (_, result) => expect(result).toEqual({ one: 1, three: 3 }));

  bdd
    .given('a JSON array with value of undefined', () => [1, undefined, 3])
    .when('parsed', target => parse(jsonValueSchema, target))
    .then('should transform undefined into null', (_, result) => expect(result).toEqual([1, null, 3]));
});

scenario('Assumptions', bdd => {
  bdd
    .given('a JSON object with value of undefined', () => ({ one: 1, two: undefined, three: 3 }))
    .when('stringified then parsed', target => JSON.parse(JSON.stringify(target)))
    .then('should remove undefined values', (_, result) => expect(result).toEqual({ one: 1, three: 3 }));

  bdd
    .given('a JSON array with value of undefined', () => [1, undefined, 3])
    .when('stringified then parsed', target => JSON.parse(JSON.stringify(target)))
    .then('should transform undefined into null', (_, result) => expect(result).toEqual([1, null, 3]));
});
