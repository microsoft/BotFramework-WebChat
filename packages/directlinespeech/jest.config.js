const { defaults } = require('jest-config');

const TRANSFORM_IGNORE_PACKAGES = ['microsoft-cognitiveservices-speech-sdk', 'uuid'];

module.exports = {
  ...defaults,
  setupFiles: ['<rootDir>/__tests__/utilities/setupJest.js'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/utilities/setupTestNightly.js'],
  testPathIgnorePatterns: [...defaults.testPathIgnorePatterns, '/__tests__/utilities/', '/lib/'],
  transformIgnorePatterns: [
    // jest-environment-jsdom import packages as browser.
    // Packages, such as "uuid", export itself for browser as ES5 + ESM.
    // Since jest@28 cannot consume ESM yet, we need to transpile these packages.
    `/node_modules/(?!(${TRANSFORM_IGNORE_PACKAGES.join('|')})/)`
  ]
};
