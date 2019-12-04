const { defaults } = require('jest-config');

module.exports = {
  ...defaults,
  setupFiles: ['<rootDir>/__tests__/utilities/setupJest.js'],
  testPathIgnorePatterns: [...defaults.testPathIgnorePatterns, '/__tests__/utilities/', '/lib/']
};
