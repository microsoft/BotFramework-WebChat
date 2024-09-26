const { defaults } = require('jest-config');

const TRANSFORM_IGNORE_PACKAGES = [
  'botframework-webchat-api',
  'botframework-webchat-component',
  'botframework-webchat-core',
  'botframework-webchat',
  'character-entities',
  'decode-named-character-reference',
  'mdast-util-from-markdown',
  'mdast-util-to-string',
  'micromark-core-commonmark',
  'micromark-factory-destination',
  'micromark-factory-label',
  'micromark-factory-space',
  'micromark-factory-title',
  'micromark-factory-whitespace',
  'micromark-util-character',
  'micromark-util-chunked',
  'micromark-util-classify-character',
  'micromark-util-combine-extensions',
  'micromark-util-decode-numeric-character-reference',
  'micromark-util-decode-string',
  'micromark-util-encode',
  'micromark-util-html-tag-name',
  'micromark-util-normalize-identifier',
  'micromark-util-resolve-all',
  'micromark-util-sanitize-uri',
  'micromark-util-subtokenize',
  'micromark',
  'mime',
  'unist-util-stringify-position',
  'uuid'
];

module.exports = {
  displayName: { color: 'yellow', name: 'legacy' },
  globals: {
    npm_package_version: '0.0.0-0.jest'
  },
  // We only have 4 instances of Chromium running simultaneously.
  maxWorkers: 4,
  moduleDirectories: ['node_modules', 'packages'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  rootDir: './',
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/setup/setupDotEnv.js',
    '<rootDir>/__tests__/setup/setupGlobalAgent.js',
    '<rootDir>/__tests__/setup/preSetupTestFramework.js',
    '<rootDir>/__tests__/setup/setupCryptoGetRandomValues.js',
    '<rootDir>/__tests__/setup/setupImageSnapshot.js',
    '<rootDir>/__tests__/setup/setupTestNightly.js',
    '<rootDir>/__tests__/setup/setupTimeout.js'
  ],
  testMatch: ['**/__tests__/**/*.?([mc])[jt]s?(x)', '**/?(*.)+(spec|test).?([mc])[jt]s?(x)'],
  testPathIgnorePatterns: [
    '/lib/',
    '/node_modules/',
    '<rootDir>/__tests__/html/.*?(\\.html)',
    '<rootDir>/__tests__/html/__dist__',
    '<rootDir>/__tests__/html/__jest__',
    '<rootDir>/__tests__/html/assets',
    '<rootDir>/__tests__/setup/',
    '<rootDir>/packages/bundle/__tests__/types/__typescript__/',
    '<rootDir>/packages/core/__tests__/types/__typescript__/',
    '<rootDir>/packages/directlinespeech/__tests__/utilities/',
    '<rootDir>/packages/playground/',
    '<rootDir>/samples/'
  ],
  transform: {
    '[\\/]__tests__[\\/]html[\\/]': './babel-passthru-transformer.js',
    // '\\.html$': './html2-test-transformer.js',
    // '[\\/]__tests__[\\/]html2[\\/]': './html2-test-transformer.js',
    '\\.[jt]sx?$': './babel-jest-config.js'
  },
  transformIgnorePatterns: [
    // jest-environment-jsdom import packages as browser.
    // Packages, such as "uuid", export itself for browser as ES5 + ESM.
    // Since jest@28 cannot consume ESM yet, we need to transpile these packages.
    `/node_modules/(?!(${TRANSFORM_IGNORE_PACKAGES.join('|')})/)`,
    '/packages/(?:test/)?\\w+/(?:lib/|dist/|\\w+\\.js)',
    ...defaults.transformIgnorePatterns.filter(pattern => pattern !== '/node_modules/')
  ]
};
