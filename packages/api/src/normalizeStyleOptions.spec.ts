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

scenario('styleOptions.assistiveTechnologyAnnouncementTransport', bdd => {
  bdd
    .given('not set', () => ({}))
    .when('normalized', styleOptions => normalizeStyleOptions(styleOptions))
    .then('should default to "live-region"', (_, { assistiveTechnologyAnnouncementTransport }) =>
      expect(assistiveTechnologyAnnouncementTransport).toBe('live-region')
    )
    .and('should not warn', () => expect(consoleWarn).not.toHaveBeenCalled());

  bdd
    .given(
      'set to "aria-notify" in a browser which supports ariaNotify()',
      () => {
        // happy-dom does not implement `ariaNotify()`.
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        Object.defineProperty(Element.prototype, 'ariaNotify', { configurable: true, value: () => {} });

        return { assistiveTechnologyAnnouncementTransport: 'aria-notify' as const };
      },
      () => {
        delete (Element.prototype as { ariaNotify?: unknown }).ariaNotify;
      }
    )
    .when('normalized', styleOptions => normalizeStyleOptions(styleOptions))
    .then('should be "aria-notify"', (_, { assistiveTechnologyAnnouncementTransport }) =>
      expect(assistiveTechnologyAnnouncementTransport).toBe('aria-notify')
    )
    .and('should not warn', () => expect(consoleWarn).not.toHaveBeenCalled());

  bdd
    .given('set to "aria-notify" in a browser which does not support ariaNotify()', () => ({
      assistiveTechnologyAnnouncementTransport: 'aria-notify' as const
    }))
    .when('normalized', styleOptions => normalizeStyleOptions(styleOptions))
    .then('should fall back to "live-region"', (_, { assistiveTechnologyAnnouncementTransport }) =>
      expect(assistiveTechnologyAnnouncementTransport).toBe('live-region')
    )
    .and('should warn once', () =>
      expect(consoleWarn.mock.calls).toEqual([
        [
          '"assistiveTechnologyAnnouncementTransport" is "aria-notify" but this browser does not support ariaNotify(), will set to "live-region".'
        ]
      ])
    );

  bdd
    .given(
      'set to "aria-notify" without DOM',
      () => {
        const { Element } = globalThis;

        // Such as React Native.
        delete (globalThis as { Element?: unknown }).Element;

        return { Element, styleOptions: { assistiveTechnologyAnnouncementTransport: 'aria-notify' as const } };
      },
      ({ Element }) => {
        globalThis.Element = Element;
      }
    )
    .when('normalized', ({ styleOptions }) => normalizeStyleOptions(styleOptions))
    .then('should fall back to "live-region"', (_, { assistiveTechnologyAnnouncementTransport }) =>
      expect(assistiveTechnologyAnnouncementTransport).toBe('live-region')
    )
    .and('should warn once', () => expect(consoleWarn).toHaveBeenCalledTimes(1));

  bdd
    .given('set to an invalid value', () => ({ assistiveTechnologyAnnouncementTransport: 'auto' }))
    // @ts-expect-error "auto" is not a valid value.
    .when('normalized', styleOptions => normalizeStyleOptions(styleOptions))
    .then('should fall back to "live-region"', (_, { assistiveTechnologyAnnouncementTransport }) =>
      expect(assistiveTechnologyAnnouncementTransport).toBe('live-region')
    )
    .and('should warn once', () =>
      expect(consoleWarn.mock.calls).toEqual([
        [
          '"assistiveTechnologyAnnouncementTransport" must be "aria-notify" or "live-region", will set to "live-region".'
        ]
      ])
    );
});
