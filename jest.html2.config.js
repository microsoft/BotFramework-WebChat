module.exports = {
  displayName: { color: 'cyan', name: 'html2' },
  globals: { npm_package_version: '0.0.0-0.jest' },
  moduleFileExtensions: ['html', 'js'],
  rootDir: './',
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/setup/setupImageSnapshot.js',
    '<rootDir>/__tests__/setup/setupTestNightly.js',
    '<rootDir>/__tests__/setup/setupTimeout.js'
  ],
  testEnvironment: '<rootDir>/packages/test/harness/src/host/jest/WebDriverEnvironment.js',
  testMatch: ['<rootDir>/__tests__/html2/**/*.html'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/packages/', '<rootDir>/samples/'],
  transform: {
    '\\.html$': '<rootDir>/html2-test-transformer.js',
    '\\.[jt]sx?$': '<rootDir>/babel-jest-config.js'
  }
};
