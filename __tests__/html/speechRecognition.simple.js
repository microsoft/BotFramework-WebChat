/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

import fetch from 'node-fetch';

import fetchSpeechServicesAuthorizationToken from './__jest__/fetchSpeechServicesAuthorizationToken';

const { COGNITIVE_SERVICES_REGION, COGNITIVE_SERVICES_SUBSCRIPTION_KEY } = process.env;

describe.each([
  ['authorization token', { useAuthorizationToken: true }],
  ['subscription key', {}]
])('speech recognition using %s', (_, { useAuthorizationToken }) => {
  test('should recognize "Hello, World!".', async () => {
    let queryParams;

    if (useAuthorizationToken) {
      if (COGNITIVE_SERVICES_SUBSCRIPTION_KEY) {
        queryParams = {
          sa: await fetchSpeechServicesAuthorizationToken({
            region: COGNITIVE_SERVICES_REGION,
            subscriptionKey: COGNITIVE_SERVICES_SUBSCRIPTION_KEY
          }),
          sr: COGNITIVE_SERVICES_REGION
        };
      } else {
        console.warn(
          'No environment variable "COGNITIVE_SERVICES_SUBSCRIPTION_KEY" is set, using the authorization token from webchat-waterbottle.'
        );

        const res = await fetch('https://webchat-waterbottle.azurewebsites.net/token/speechservices');

        if (!res.ok) {
          throw new Error(
            `Failed to fetch Cognitive Services Speech Services credentials, server returned ${res.status}`
          );
        }

        const { region, token: authorizationToken } = await res.json();

        queryParams = { sa: authorizationToken, sr: region };
      }
    } else {
      if (COGNITIVE_SERVICES_SUBSCRIPTION_KEY) {
        queryParams = {
          sr: COGNITIVE_SERVICES_REGION,
          ss: COGNITIVE_SERVICES_SUBSCRIPTION_KEY
        };
      } else {
        return console.warn(
          'No environment variable "COGNITIVE_SERVICES_SUBSCRIPTION_KEY" is set, skipping this test.'
        );
      }
    }

    return runHTMLTest(`speechRecognition.simple.html#${new URLSearchParams(queryParams)}`, {
      ignoreConsoleError: true
    });
  });
});
