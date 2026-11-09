/** @jest-environment @happy-dom/jest-environment */

import { scenario } from '@testduet/given-when-then';
import { AudioConfig, AudioInputStream } from 'microsoft-cognitiveservices-speech-sdk';

import createAdapters from './createAdapters';

const BEARER_WARNING = 'botframework-directlinespeech-sdk: Remove "Bearer" from the authorization token.';
const TOKEN_RENEWAL_INTERVAL = 120000; // Same as in createAdapters.js.

let consoleWarn;

// Not cleared between tests: the warning is once per module load.
beforeAll(() => {
  // eslint-disable-next-line no-empty-function
  consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
});

beforeEach(() => jest.useFakeTimers());

afterEach(() => jest.useRealTimers());

// createWebSpeechPonyfillFactory also warns: happy-dom has no AudioContext.
const bearerWarnings = () => consoleWarn.mock.calls.filter(([message]) => message === BEARER_WARNING);

scenario('Authorization token prefixed with "Bearer"', bdd => {
  bdd
    .given('fetchCredentials returning "Bearer token-1", then "Bearer token-2"', () => {
      let numCall = 0;

      return () => Promise.resolve({ authorizationToken: `Bearer token-${++numCall}`, region: 'westus' });
    })
    .when('adapters are created', fetchCredentials =>
      createAdapters({
        audioConfig: AudioConfig.fromStreamInput(AudioInputStream.createPushStream()),
        fetchCredentials
      })
    )
    .then('should set the token without "Bearer"', (_, { directLine }) =>
      expect(directLine.dialogServiceConnector.authorizationToken).toBe('token-1')
    )
    .and('should warn once', () => expect(bearerWarnings()).toHaveLength(1))
    .when('the token is renewed after 2 minutes', async (_, adapters) => {
      await jest.advanceTimersByTimeAsync(TOKEN_RENEWAL_INTERVAL);

      return adapters;
    })
    .then('should set the renewed token without "Bearer"', (_, { directLine }) =>
      expect(directLine.dialogServiceConnector.authorizationToken).toBe('token-2')
    )
    .and('should not warn again', () => expect(bearerWarnings()).toHaveLength(1));
});

scenario('Authorization token without "Bearer"', bdd => {
  bdd
    .given(
      'fetchCredentials returning "token-1"',
      () => () => Promise.resolve({ authorizationToken: 'token-1', region: 'westus' })
    )
    .when('adapters are created', fetchCredentials =>
      createAdapters({
        audioConfig: AudioConfig.fromStreamInput(AudioInputStream.createPushStream()),
        fetchCredentials
      })
    )
    .then('should set the token as is', (_, { directLine }) =>
      expect(directLine.dialogServiceConnector.authorizationToken).toBe('token-1')
    );
});
