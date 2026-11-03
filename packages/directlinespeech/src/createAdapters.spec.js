/** @jest-environment @happy-dom/jest-environment */

import { scenario } from '@testduet/given-when-then';
import { AudioConfig, AudioInputStream } from 'microsoft-cognitiveservices-speech-sdk';

import createAdapters from './createAdapters';

const TOKEN_RENEWAL_INTERVAL = 120000; // Same as in createAdapters.js.

beforeEach(() => {
  jest.useFakeTimers();

  // eslint-disable-next-line no-empty-function
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => jest.useRealTimers());

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
    // Speech SDK adds "Bearer " itself.
    .then('should set the token without "Bearer"', (_, { directLine }) =>
      expect(directLine.dialogServiceConnector.authorizationToken).toBe('token-1')
    )
    .when('the token is renewed after 2 minutes', async (_, adapters) => {
      await jest.advanceTimersByTimeAsync(TOKEN_RENEWAL_INTERVAL);

      return adapters;
    })
    .then('should set the renewed token without "Bearer"', (_, { directLine }) =>
      expect(directLine.dialogServiceConnector.authorizationToken).toBe('token-2')
    );
});
