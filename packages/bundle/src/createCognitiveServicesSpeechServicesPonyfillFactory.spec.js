/* eslint-disable prefer-destructuring */
/* eslint-disable no-global-assign */
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  createCognitiveServicesSpeechServicesPonyfillFactory = require('./createCognitiveServicesSpeechServicesPonyfillFactory')
    .default;

  window.navigator.mediaDevices = {};
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

test('supplying audioInputDeviceId', () => {
  const ponyfillFactory = createCognitiveServicesSpeechServicesPonyfillFactory({
    audioInputDeviceId: 'audio-input-device-1',
    credentials: {
      authorizationToken: 'a1b2c3d',
      region: 'westus2'
    }
  });

  ponyfillFactory({});

  expect(createPonyfill.mock.calls[0][0]).toHaveProperty('audioConfig.privSource.deviceId', 'audio-input-device-1');
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
