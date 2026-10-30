/// <reference types="jest" />

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';

import pickCSSModule from './pickCSSModule';

scenario(
  'pickCSSModule',
  bdd => {
    bdd
      .given('a CSS module with three local names', () =>
        Object.freeze({
          bubble: 'wA_bubble',
          bubble__content: 'wA_bubble__content',
          'part-grouping-decorator': 'wA_part-grouping-decorator'
        })
      )
      .when('picking two of them', cssModule => pickCSSModule(cssModule, ['bubble', 'bubble__content']))
      .then('should return the class names of the picked local names only', (_, result) =>
        expect(result).toStrictEqual({ bubble: 'wA_bubble', bubble__content: 'wA_bubble__content' })
      )
      .and('the result should be frozen', (_, result) => expect(Object.isFrozen(result)).toBe(true));

    bdd
      .given('a CSS module without "bubble"', () =>
        Object.freeze({ 'part-grouping-decorator': 'wA_part-grouping-decorator' })
      )
      .when('picking "bubble"', cssModule => () => pickCSSModule(cssModule, ['bubble']))
      .then('should throw', (_, pick) =>
        expect(pick).toThrow('The CSS module does not define the local name "bubble".')
      );
  },
  JestGlobals
);
