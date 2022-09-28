/**
 * @jest-environment jsdom
 * @jest-environment-options { "customExportConditions": ["node"] }
 *
 * "uuid" resolved by jest-environment-jsdom use Web Crypto API.
 * However, "jsdom" does not support Web Crypto API. Thus, we need to import packages as Node.js instead.
 */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-global-assign */
import random from 'math-random';

let consoleWarns;
let createCognitiveServicesSpeechServicesPonyfillFactory;
let createPonyfill;
let originalConsole;

beforeEach(() => {
  jest.mock('web-speech-cognitive-services/lib/SpeechServices', () => jest.fn(() => ({})));

  originalConsole = console;
  consoleWarns = [];

  console = {
    ...console,
    warn: text => consoleWarns.push(text)
  };

  createPonyfill = require('web-speech-cognitive-services/lib/SpeechServices');
  createCognitiveServicesSpeechServicesPonyfillFactory =
    require('./createCognitiveServicesSpeechServicesPonyfillFactory').default;

  window.AudioContext = class MockAudioContext {
    // eslint-disable-next-line class-methods-use-this
    createMediaStreamSource() {
      // eslint-disable-next-line no-empty-function
      return { connect: () => {} };
    }

    // eslint-disable-next-line class-methods-use-this
    createScriptProcessor() {
      // eslint-disable-next-line no-empty-function
      return { connect: () => {} };
    }
  };

  window.URL = {
    ...window.URL,
    // Even when AudioContext does not support audio worklet, PCMRecorder always create it via URL.createObjectURL().
    // As JSDOM does not support URL.createObjectURL(), we need to return a dummy blob URL.
    // https://github.com/microsoft/cognitive-services-speech-sdk-js/issues/572
    // eslint-disable-next-line no-magic-numbers
    createObjectURL: () => `blob:${random().toString(36).substring(2)}`
  };

  window.navigator.mediaDevices = {
    getUserMedia: jest.fn(() => ({
      getAudioTracks: () => ['mock-media-stream-track']
    }))
  };
});

afterEach(() => {
  console = originalConsole;

  jest.resetModules();
});

test('providing reference grammar ID', () => {
  const ponyfillFactory = createCognitiveServicesSpeechServicesPonyfillFactory({
    credentials: {
      authorizationToken: 'a1b2c3d',
      region: 'westus2'
    }
  });

  ponyfillFactory({ referenceGrammarID: 'a1b2c3d' });

  const { referenceGrammars } = createPonyfill.mock.calls[0][0];

  expect(referenceGrammars).toEqual(['luis/a1b2c3d-PRODUCTION']);
});

test('not providing reference grammar ID', () => {
  const ponyfillFactory = createCognitiveServicesSpeechServicesPonyfillFactory({
    credentials: {
      authorizationToken: 'a1b2c3d',
      region: 'westus2'
    }
  });

  ponyfillFactory({});

  const { referenceGrammars } = createPonyfill.mock.calls[0][0];

  expect(referenceGrammars).toEqual([]);
});

test('supplying audioInputDeviceId', async () => {
  // GIVEN: Set up Web Speech with "audioInputDeviceId" of "audio-input-device-1".
  const ponyfillFactory = createCognitiveServicesSpeechServicesPonyfillFactory({
    audioInputDeviceId: 'audio-input-device-1',
    credentials: {
      authorizationToken: 'a1b2c3d',
      region: 'westus2'
    }
  });

  // WHEN: Polyfill is created.
  ponyfillFactory({});

  // WHEN: Audio source is attached and audio device is opened.
  await createPonyfill.mock.calls[0][0].audioConfig.privSource.attach();

  // THEN: It should call getUserMedia() with "audio" constraints of { deviceId: 'audio-input-device-1' }.
  expect(window.navigator.mediaDevices.getUserMedia.mock.calls[0][0]).toHaveProperty(
    'audio.deviceId',
    'audio-input-device-1'
  );

  // THEN: It should call getUserMedia() with "video" constraint of false.
  expect(window.navigator.mediaDevices.getUserMedia.mock.calls[0][0]).toHaveProperty('video', false);
});

test('supplying both audioConfig and audioInputDeviceId', () => {
  const audioConfig = {};
  const ponyfillFactory = createCognitiveServicesSpeechServicesPonyfillFactory({
    audioConfig,
    audioInputDeviceId: 'audio-input-device-1',
    credentials: {
      authorizationToken: 'a1b2c3d',
      region: 'westus2'
    }
  });

  ponyfillFactory({});

  expect(consoleWarns[0]).toMatchInlineSnapshot(
    `"botframework-webchat: \\"audioConfig\\" and \\"audioInputDeviceId\\" cannot be set at the same time; ignoring \\"audioInputDeviceId\\"."`
  );

  expect(createPonyfill.mock.calls[0][0].audioConfig).toBe(audioConfig);
});

test('unsupported environment', () => {
  window.navigator.mediaDevices = null;

  const ponyfillFactory = createCognitiveServicesSpeechServicesPonyfillFactory({
    credentials: {
      authorizationToken: 'a1b2c3d',
      region: 'westus2'
    }
  });

  const ponyfill = ponyfillFactory({});

  expect(consoleWarns[0]).toMatchInlineSnapshot(
    `"botframework-webchat: Your browser does not support Web Audio or the page is not loaded via HTTPS or localhost. Cognitive Services Speech Services is disabled. However, you may pass a custom AudioConfig to enable speech in this environment."`
  );

  expect(ponyfill).toEqual({});
});

test('unsupported environment with audioConfig', () => {
  window.navigator.mediaDevices = null;

  const audioConfig = {};

  const ponyfillFactory = createCognitiveServicesSpeechServicesPonyfillFactory({
    audioConfig,
    credentials: {
      authorizationToken: 'a1b2c3d',
      region: 'westus2'
    }
  });

  ponyfillFactory({});

  expect(consoleWarns).toHaveProperty('length', 0);
  expect(createPonyfill.mock.calls[0][0].audioConfig).toBe(audioConfig);
});
