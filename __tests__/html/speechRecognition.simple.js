/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

import fetch from 'node-fetch';

import fetchSpeechServicesAuthorizationToken from './__jest__/fetchSpeechServicesAuthorizationToken';

const {
  COGNITIVE_SERVICES_REGION,
  COGNITIVE_SERVICES_SUBSCRIPTION_KEY,
  DIRECT_LINE_SPEECH_REGION,
  DIRECT_LINE_SPEECH_SUBSCRIPTION_KEY
} = process.env;

describe.each([
  ['authorization token with Direct Line protocol', { useAuthorizationToken: true }],
  ['subscription key with Direct Line protocol', {}],
  ['authorization token with Direct Line Speech protocol', { useAuthorizationToken: true, useDirectLineSpeech: true }],
  ['subscription key with Direct Line Speech protocol', { useDirectLineSpeech: true }]
])('speech recognition using %s', (_, { useAuthorizationToken, useDirectLineSpeech }) => {
  test('should recognize "Hello, World!".', async () => {
    let queryParams;

    if (useAuthorizationToken) {
      if (useDirectLineSpeech && DIRECT_LINE_SPEECH_SUBSCRIPTION_KEY) {
        queryParams = {
          sa: await fetchSpeechServicesAuthorizationToken({
            region: DIRECT_LINE_SPEECH_REGION,
            subscriptionKey: DIRECT_LINE_SPEECH_SUBSCRIPTION_KEY
          }),
          sr: DIRECT_LINE_SPEECH_REGION,
          t: 'dlspeech'
        };
      } else if (!useDirectLineSpeech && COGNITIVE_SERVICES_SUBSCRIPTION_KEY) {
        queryParams = {
          sa: await fetchSpeechServicesAuthorizationToken({
            region: COGNITIVE_SERVICES_REGION,
            subscriptionKey: COGNITIVE_SERVICES_SUBSCRIPTION_KEY
          }),
          sr: COGNITIVE_SERVICES_REGION,
          t: 'dl'
        };
      } else {
        if (useDirectLineSpeech) {
          console.warn(
            'No environment variable "DIRECT_LINE_SPEECH_SUBSCRIPTION_KEY" is set, using the authorization token from webchat-waterbottle.'
          );
        } else {
          console.warn(
            'No environment variable "COGNITIVE_SERVICES_SUBSCRIPTION_KEY" is set, using the authorization token from webchat-waterbottle.'
          );
        }

        const res = await fetch('https://webchat-mockbot-streaming.azurewebsites.net/speechservices/token', {
          headers: { origin: 'http://localhost' },
          method: 'POST'
        });

        if (!res.ok) {
          throw new Error(
            `Failed to fetch Cognitive Services Speech Services credentials, server returned ${res.status}`
          );
        }

        const { region, token: authorizationToken } = await res.json();

        queryParams = { sa: authorizationToken, sr: region, t: useDirectLineSpeech ? 'dlspeech' : 'dl' };
      }
    } else {
      if (useDirectLineSpeech) {
        if (DIRECT_LINE_SPEECH_SUBSCRIPTION_KEY) {
          queryParams = {
            sr: DIRECT_LINE_SPEECH_REGION,
            ss: DIRECT_LINE_SPEECH_SUBSCRIPTION_KEY,
            t: 'dlspeech'
          };
        } else {
          return console.warn(
            'No environment variable "DIRECT_LINE_SPEECH_SUBSCRIPTION_KEY" is set, skipping this test.'
          );
        }
      } else {
        if (COGNITIVE_SERVICES_SUBSCRIPTION_KEY) {
          queryParams = {
            sr: COGNITIVE_SERVICES_REGION,
            ss: COGNITIVE_SERVICES_SUBSCRIPTION_KEY,
            t: 'dl'
          };
        } else {
          return console.warn(
            'No environment variable "COGNITIVE_SERVICES_SUBSCRIPTION_KEY" is set, skipping this test.'
          );
        }
      }
    }

    return runHTMLTest(`speechRecognition.simple.html#${new URLSearchParams(queryParams)}`, {
      ignoreConsoleError: true
    });
  });
});
