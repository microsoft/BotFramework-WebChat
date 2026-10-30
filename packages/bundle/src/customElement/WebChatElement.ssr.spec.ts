/** @jest-environment node */
/// <reference types="jest" />

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';

jest.mock('../FullReactWebChat', () => ({ __esModule: true, default: () => null }));

scenario(
  'WebChatElement in Node.js (server-side rendering)',
  bdd => {
    bdd
      .given('no HTMLElement', () => expect(typeof globalThis.HTMLElement).toBe('undefined'))
      .when('the module is imported', () => require('./WebChatElement'))
      .then('should export the class without throwing', (_, { default: WebChatElement }) =>
        expect(typeof WebChatElement).toBe('function')
      );
  },
  JestGlobals
);
