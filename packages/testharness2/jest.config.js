module.exports = {
  setupFilesAfterEnv: ['<rootDir>/src/host/jest/runHTML.js', '<rootDir>/src/host/jest/setupToMatchImageSnapshot.js'],
  testTimeout: 10000,
  transform: {}
};
