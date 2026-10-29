/// <reference types="jest" />

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';

import combineCSSModules from './combineCSSModules';

scenario(
  'combineCSSModules',
  bdd => {
    bdd
      .given('two CSS modules that both define "bubble"', () =>
        Object.freeze([
          Object.freeze({ bubble: 'wA_bubble', 'bubble--from-user': 'wA_bubble--from-user' }),
          Object.freeze({ bubble: 'wB_bubble', transcript: 'wB_transcript' })
        ])
      )
      .when('combined', cssModules => combineCSSModules(...cssModules))
      .then('"bubble" should have the class names of both modules, in order', (_, result) =>
        expect(result).toHaveProperty('bubble', 'wA_bubble wB_bubble')
      )
      .and('other local names should be kept as-is', (_, result) =>
        expect(result).toStrictEqual({
          bubble: 'wA_bubble wB_bubble',
          'bubble--from-user': 'wA_bubble--from-user',
          transcript: 'wB_transcript'
        })
      )
      .and('the result should be frozen', (_, result) => expect(Object.isFrozen(result)).toBe(true));

    bdd
      .given('a combined module and one of its modules again', () =>
        Object.freeze([
          Object.freeze({ bubble: 'wA_bubble wB_bubble' }), // Output of an earlier combineCSSModules()
          Object.freeze({ bubble: 'wA_bubble' })
        ])
      )
      .when('combined', cssModules => combineCSSModules(...cssModules))
      .then('every class name should appear once', (_, result) =>
        expect(result).toStrictEqual({ bubble: 'wA_bubble wB_bubble' })
      );

    bdd
      .given('a module with an empty class name', () => Object.freeze([Object.freeze({ bubble: '' })]))
      .when('combined', cssModules => combineCSSModules(...cssModules))
      .then('the local name should be left out', (_, result) => expect(result).toStrictEqual({}));

    bdd
      .given('no modules', () => Object.freeze([]))
      .when('combined', cssModules => combineCSSModules(...cssModules))
      .then('the result should be an empty frozen map', (_, result) => {
        expect(result).toStrictEqual({});
        expect(Object.isFrozen(result)).toBe(true);
      });

    bdd
      .given('a module with a non-string class name', () => Object.freeze([Object.freeze({ bubble: 1 })]))
      .when('combined', cssModules => {
        try {
          combineCSSModules(...cssModules);
        } catch (error) {
          return error;
        }

        return undefined;
      })
      .then('it should throw', (_, error) => expect(error).toBeInstanceOf(Error));
  },
  JestGlobals
);
