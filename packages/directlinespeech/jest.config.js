const { defaults } = require('jest-config');

module.exports = {
  ...defaults,
  setupFiles: ['<rootDir>/__tests__/utilities/setupJest.js'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/utilities/setupTestNightly.js'],
  testPathIgnorePatterns: [...defaults.testPathIgnorePatterns, '/__tests__/utilities/', '/lib/']
};
