/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

import fetchSpeechServicesAuthorizationToken from './__jest__/fetchSpeechServicesAuthorizationToken';

describe.each([
  ['authorization token', { useAuthorizationToken: true }],
  ['subscription key', {}]
])('speech recognition using %s', (_, { useAuthorizationToken }) => {
  test('should recognize "Hello, World!".', async () => {
    const queryParams = new URLSearchParams({
      sr: process.env.COGNITIVE_SERVICES_REGION,
      ...(useAuthorizationToken
        ? {
            sa: await fetchSpeechServicesAuthorizationToken({
              region: process.env.COGNITIVE_SERVICES_REGION,
              subscriptionKey: process.env.COGNITIVE_SERVICES_SUBSCRIPTION_KEY
            })
          }
        : {
            ss: process.env.COGNITIVE_SERVICES_SUBSCRIPTION_KEY
          })
    });

    return runHTMLTest(`speechRecognition.simple.html#${queryParams}`, { ignoreConsoleError: true });
  });
});
