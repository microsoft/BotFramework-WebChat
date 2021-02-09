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
  ['authorization token with Direct Line protocol using hostname', { useAuthorizationToken: true, useHostname: true }],
  ['subscription key with Direct Line protocol', {}],
  ['subscription key with Direct Line protocol using hostname', { useHostname: true }],
  ['authorization token with Direct Line Speech protocol', { useAuthorizationToken: true, useDirectLineSpeech: true }],
  [
    'authorization token with Direct Line Speech protocol using hostname',
    { useAuthorizationToken: true, useDirectLineSpeech: true, useHostname: true }
  ],
  ['subscription key with Direct Line Speech protocol', { useDirectLineSpeech: true }],
  ['subscription key with Direct Line Speech protocol using hostname', { useDirectLineSpeech: true, useHostname: true }]
])('speech recognition using %s', (_, { useAuthorizationToken, useDirectLineSpeech, useHostname }) => {
  test('should recognize "Hello, World!".', async () => {
    let queryParams;

    if (useAuthorizationToken) {
      if (useDirectLineSpeech && DIRECT_LINE_SPEECH_SUBSCRIPTION_KEY) {
        queryParams = {
          sa: await fetchSpeechServicesAuthorizationToken({
            region: DIRECT_LINE_SPEECH_REGION,
            subscriptionKey: DIRECT_LINE_SPEECH_SUBSCRIPTION_KEY
          }),
          t: 'dlspeech'
        };

        if (useHostname) {
          queryParams.dlsh = `${DIRECT_LINE_SPEECH_REGION}.convai.speech.microsoft.com`;
          queryParams.srh = `${DIRECT_LINE_SPEECH_REGION}.stt.speech.microsoft.com`;
          queryParams.ssh = `${DIRECT_LINE_SPEECH_REGION}.tts.speech.microsoft.com`;
        } else {
          queryParams.sr = DIRECT_LINE_SPEECH_REGION;
        }
      } else if (!useDirectLineSpeech && COGNITIVE_SERVICES_SUBSCRIPTION_KEY) {
        queryParams = {
          sa: await fetchSpeechServicesAuthorizationToken({
            region: COGNITIVE_SERVICES_REGION,
            subscriptionKey: COGNITIVE_SERVICES_SUBSCRIPTION_KEY
          }),
          t: 'dl'
        };

        if (useHostname) {
          queryParams.srh = `${COGNITIVE_SERVICES_REGION}.stt.speech.microsoft.com`;
          queryParams.ssh = `${COGNITIVE_SERVICES_REGION}.tts.speech.microsoft.com`;
        } else {
          queryParams.sr = COGNITIVE_SERVICES_REGION;
        }
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

        queryParams = { sa: authorizationToken, t: useDirectLineSpeech ? 'dlspeech' : 'dl' };

        if (useHostname) {
          if (useDirectLineSpeech) {
            queryParams.dlsh = `${region}.convai.speech.microsoft.com`;
          }

          queryParams.srh = `${region}.stt.speech.microsoft.com`;
          queryParams.ssh = `${region}.tts.speech.microsoft.com`;
        } else {
          queryParams.sr = region;
        }
      }
    } else {
      if (useDirectLineSpeech) {
        if (DIRECT_LINE_SPEECH_SUBSCRIPTION_KEY) {
          queryParams = {
            ss: DIRECT_LINE_SPEECH_SUBSCRIPTION_KEY,
            t: 'dlspeech'
          };

          if (useHostname) {
            queryParams.dlsh = `${DIRECT_LINE_SPEECH_REGION}.convai.speech.microsoft.com`;
            queryParams.srh = `${DIRECT_LINE_SPEECH_REGION}.stt.speech.microsoft.com`;
            queryParams.ssh = `${DIRECT_LINE_SPEECH_REGION}.tts.speech.microsoft.com`;
          } else {
            queryParams.sr = DIRECT_LINE_SPEECH_REGION;
          }
        } else {
          return console.warn(
            'No environment variable "DIRECT_LINE_SPEECH_SUBSCRIPTION_KEY" is set, skipping this test.'
          );
        }
      } else {
        if (COGNITIVE_SERVICES_SUBSCRIPTION_KEY) {
          queryParams = {
            ss: COGNITIVE_SERVICES_SUBSCRIPTION_KEY,
            t: 'dl'
          };

          if (useHostname) {
            queryParams.srh = `${COGNITIVE_SERVICES_REGION}.stt.speech.microsoft.com`;
            queryParams.ssh = `${COGNITIVE_SERVICES_REGION}.tts.speech.microsoft.com`;
          } else {
            queryParams.sr = COGNITIVE_SERVICES_REGION;
          }
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
