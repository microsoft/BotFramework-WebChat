import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import { safeParse } from 'valibot';
import identifier from './Identifier';

scenario('identifier()', bdd => {
  bdd
    .given('an empty string', () => '')
    .when('parsed', value => safeParse(identifier(), value))
    .then('should fail', (_, result) => expect(result).toHaveProperty('success', false));

  bdd
    .given('a blank node identifier', () => '_:b1')
    .when('parsed', value => safeParse(identifier(), value))
    .then('should success', (_, result) => expect(result).toHaveProperty('success', true));

  bdd
    .given('a URL', () => 'https://aka.ms')
    .when('parsed', value => safeParse(identifier(), value))
    .then('should success', (_, result) => expect(result).toHaveProperty('success', true));
});
