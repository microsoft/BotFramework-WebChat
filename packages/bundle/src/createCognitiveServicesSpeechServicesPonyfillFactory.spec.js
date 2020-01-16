let createPonyfill;
let originalConsole;
let consoleWarns;

async function resolveFunctionOrValue(fnOrValue) {
  return await (typeof fnOrValue === 'function' ? fnOrValue() : fnOrValue);
}

beforeEach(() => {
  jest.mock('web-speech-cognitive-services/lib/SpeechServices', () => jest.fn(() => ({})));

  originalConsole = console;
  consoleWarns = [];

  console = {
    ...console,
    warn: text => consoleWarns.push(text)
  };

  createPonyfill = require('web-speech-cognitive-services/lib/SpeechServices');
});

afterEach(() => {
  console = originalConsole;

  jest.resetModules();
});

test('upgrading authorizationToken to credentials', async () => {
  const createCognitiveServicesSpeechServicesPonyfillFactory = require('./createCognitiveServicesSpeechServicesPonyfillFactory')
    .default;

  const ponyfillFactory = createCognitiveServicesSpeechServicesPonyfillFactory({
    authorizationToken: 'a1b2c3d',
    region: 'westus2'
  });

  ponyfillFactory();

  const { credentials } = createPonyfill.mock.calls[0][0];

  await expect(resolveFunctionOrValue(credentials)).resolves.toEqual({
    authorizationToken: 'a1b2c3d',
    region: 'westus2'
  });

  expect(consoleWarns[0]).toMatchInlineSnapshot(
    `"botframework-webchat: \\"authorizationToken\\", \\"region\\", and \\"subscriptionKey\\" are being deprecated and will be removed on or after 2020-12-17. Please use \\"credentials\\" instead."`
  );
});

test('upgrading subscriptionKey to credentials', async () => {
  const createCognitiveServicesSpeechServicesPonyfillFactory = require('./createCognitiveServicesSpeechServicesPonyfillFactory')
    .default;

  const ponyfillFactory = createCognitiveServicesSpeechServicesPonyfillFactory({
    region: 'westus2',
    subscriptionKey: 'a1b2c3d'
  });

  ponyfillFactory();

  const { credentials } = createPonyfill.mock.calls[0][0];

  await expect(resolveFunctionOrValue(credentials)).resolves.toEqual({
    region: 'westus2',
    subscriptionKey: 'a1b2c3d'
  });

  expect(consoleWarns[0]).toMatchInlineSnapshot(
    `"botframework-webchat: \\"authorizationToken\\", \\"region\\", and \\"subscriptionKey\\" are being deprecated and will be removed on or after 2020-12-17. Please use \\"credentials\\" instead."`
  );
});

test('providing reference grammar ID', () => {
  const createCognitiveServicesSpeechServicesPonyfillFactory = require('./createCognitiveServicesSpeechServicesPonyfillFactory')
    .default;

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
  const createCognitiveServicesSpeechServicesPonyfillFactory = require('./createCognitiveServicesSpeechServicesPonyfillFactory')
    .default;

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
