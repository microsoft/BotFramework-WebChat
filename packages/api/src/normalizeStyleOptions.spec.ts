/** @jest-environment @happy-dom/jest-environment */

import { scenario } from '@testduet/given-when-then';
import type NormalizeStyleOptionsType from './normalizeStyleOptions';

let consoleWarn: jest.SpyInstance;
let normalizeStyleOptions: typeof NormalizeStyleOptionsType;

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

  // Warns on every call instead of once per page, so each scenario can count its own warnings.
  jest.mock('@msinternal/botframework-webchat-base/utils', () => ({
    ...jest.requireActual('@msinternal/botframework-webchat-base/utils'),
    warnOnce:
      (...args) =>
      () =>
        console.warn(...args)
  }));

  normalizeStyleOptions = require('./normalizeStyleOptions').default;
});

afterEach(() => consoleWarn.mockClear());

scenario('styleOptions.announcementTransport', bdd => {
  bdd
    .given('not set', () => ({}))
    .when('normalized', styleOptions => normalizeStyleOptions(styleOptions))
    .then('should default to "live-region"', (_, { announcementTransport }) =>
      expect(announcementTransport).toBe('live-region')
    )
    .and('should not warn', () => expect(consoleWarn).not.toHaveBeenCalled());

  bdd
    .given('set to "aria-notify"', () => ({ announcementTransport: 'aria-notify' as const }))
    .when('normalized', styleOptions => normalizeStyleOptions(styleOptions))
    .then('should be "aria-notify"', (_, { announcementTransport }) =>
      expect(announcementTransport).toBe('aria-notify')
    )
    .and('should not warn', () => expect(consoleWarn).not.toHaveBeenCalled());

  bdd
    .given('set to an invalid value', () => ({ announcementTransport: 'auto' }))
    // @ts-expect-error "auto" is not a valid value.
    .when('normalized', styleOptions => normalizeStyleOptions(styleOptions))
    .then('should fall back to "live-region"', (_, { announcementTransport }) =>
      expect(announcementTransport).toBe('live-region')
    )
    .and('should warn once', () =>
      expect(consoleWarn.mock.calls).toEqual([
        ['"announcementTransport" must be "aria-notify" or "live-region", will set to "live-region".']
      ])
    );
});
