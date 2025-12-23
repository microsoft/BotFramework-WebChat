module.exports = {
  displayName: { color: 'cyan', name: 'html2' },
  globals: { npm_package_version: '0.0.0-0.jest' },
  moduleFileExtensions: ['html', 'js'], // Will cause fail validation error if 'js' is not included.
  rootDir: '../html2/',
  setupFilesAfterEnv: [
    '<rootDir>/../html2.setup/setupFiles/setupImageSnapshot.js',
    '<rootDir>/../html2.setup/setupFiles/setupTestNightly.js',
    '<rootDir>/../html2.setup/setupFiles/setupTimeout.js'
  ],
  testEnvironment: '<rootDir>/../../packages/test/harness/src/host/jest/WebDriverEnvironment.js', // Cannot load environment in HTML file due to syntax requirements. Jest also ignores environment comment in transformed file.
  testMatch: ['<rootDir>/../html2/**/*.html'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/packages/', '<rootDir>/samples/'], // Jest will warn obsoleted snapshots outside of "testMatch", need "testPathIgnorePatterns" to skip checking obsoleted snapshots.
  transform: {
    '\\.html$': '<rootDir>/../html2.setup/transformer/htmlTransformer.js'
  }
};
