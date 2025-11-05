import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import { safeParse } from 'valibot';
import { IdentifierSchema } from './Identifier';

scenario('IdentifierSchema', bdd => {
  bdd
    .given('an empty string', () => '')
    .when('parsed', value => safeParse(IdentifierSchema, value))
    .then('should fail', (_, result) => expect(result).toHaveProperty('success', false));

  bdd
    .given('a blank node identifier', () => '_:b1')
    .when('parsed', value => safeParse(IdentifierSchema, value))
    .then('should success', (_, result) => expect(result).toHaveProperty('success', true));

  bdd
    .given('a URL', () => 'https://aka.ms')
    .when('parsed', value => safeParse(IdentifierSchema, value))
    .then('should success', (_, result) => expect(result).toHaveProperty('success', true));
});
