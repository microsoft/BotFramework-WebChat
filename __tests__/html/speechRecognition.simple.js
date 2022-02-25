/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

const fetch = require('node-fetch');

const {
  COGNITIVE_SERVICES_REGION,
  COGNITIVE_SERVICES_SUBSCRIPTION_KEY,
  DIRECT_LINE_SPEECH_REGION,
  DIRECT_LINE_SPEECH_SUBSCRIPTION_KEY
} = process.env;

describe.each([
  ['authorization token with Direct Line protocol', {}],
  ['authorization token with Direct Line protocol using hostname', { useHostname: true }],
  ['subscription key with Direct Line protocol', {}],
  ['subscription key with Direct Line protocol using hostname', { useHostname: true, useSubscriptionKey: true }],
  ['authorization token with Direct Line Speech protocol', { useDirectLineSpeech: true }],
  [
    'authorization token with Direct Line Speech protocol using hostname',
    { useDirectLineSpeech: true, useHostname: true }
  ],
  ['subscription key with Direct Line Speech protocol', { useDirectLineSpeech: true, useSubscriptionKey: true }],
  [
    'subscription key with Direct Line Speech protocol using hostname',
    { useDirectLineSpeech: true, useHostname: true, useSubscriptionKey: true }
  ]
])('speech recognition using %s', (_, { useSubscriptionKey, useDirectLineSpeech, useHostname }) => {
  test.nightly('should recognize "Hello, World!".', async () => {
    if (!useDirectLineSpeech && !COGNITIVE_SERVICES_SUBSCRIPTION_KEY) {
      throw new Error('"COGNITIVE_SERVICES_SUBSCRIPTION_KEY" must be set.');
    } else if (useDirectLineSpeech && !DIRECT_LINE_SPEECH_SUBSCRIPTION_KEY) {
      throw new Error('"DIRECT_LINE_SPEECH_SUBSCRIPTION_KEY" must be set.');
    }

    const { token } = await (
      await fetch('https://webchat-mockbot3.azurewebsites.net/api/token/directline', { method: 'POST' })
    ).json();

    const params = new URLSearchParams({
      'dl.token': token,
      'dls.key': DIRECT_LINE_SPEECH_SUBSCRIPTION_KEY || '',
      'dls.region': DIRECT_LINE_SPEECH_REGION || '',
      'speech.key': COGNITIVE_SERVICES_SUBSCRIPTION_KEY || '',
      'speech.region': COGNITIVE_SERVICES_REGION || '',
      host: useHostname || '',
      key: useSubscriptionKey || '',
      type: useDirectLineSpeech ? 'dlspeech' : 'dl'
    });

    return runHTML(`speechRecognition.simple.html#${params}`);
  });
});
