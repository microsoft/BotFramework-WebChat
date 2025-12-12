const { defaults } = require('jest-config');

const TRANSFORM_IGNORE_PACKAGES = [
  // 'botframework-webchat-api',
  // 'botframework-webchat-component',
  // 'botframework-webchat-core',
  // 'botframework-webchat',

  // General
  'merge-refs',
  'mime',
  'uuid',

  // Related to micromark
  'character-entities',
  'decode-named-character-reference',
  'mdast-util-from-markdown',
  'mdast-util-to-string',
  'micromark-core-commonmark',
  'micromark-extension-gfm',
  'micromark-extension-gfm-autolink-literal',
  'micromark-extension-gfm-footnote',
  'micromark-extension-gfm-strikethrough',
  'micromark-extension-gfm-table',
  'micromark-extension-gfm-tagfilter',
  'micromark-extension-gfm-task-list-item',
  'micromark-extension-math',
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
  'unist-util-stringify-position',

  // Related to Speech SDK.
  'microsoft-cognitiveservices-speech-sdk',

  // Related to Adaptive Cards.
  'dom7',
  'ssr-window',
  'swiper'
];

module.exports = {
  displayName: { color: 'yellow', name: 'unit' },
  globals: {
    npm_package_version: '0.0.0-0.jest'
  },
  moduleDirectories: ['node_modules', 'packages'],
  moduleFileExtensions: ['js', 'jsx', 'mjs', 'ts', 'tsx'],
  rootDir: '../../packages/',
  setupFilesAfterEnv: [
    '<rootDir>/../__tests__/setup.unit/setupCryptoGetRandomValues.js',
    '<rootDir>/../__tests__/setup.unit/setupCryptoRandomUUID.js',
    '<rootDir>/../__tests__/setup.unit/setupTestNightly.js',
    '<rootDir>/../__tests__/setup.unit/setupTimeout.js'
  ],
  testMatch: ['**/?(*.)+(spec|test).?([mc])[jt]s?(x)'],
  testPathIgnorePatterns: [
    '/dist/',
    '/lib/',
    '/node_modules/',
    '/static/',
    '<rootDir>/bundle/__tests__/types/__typescript__/',
    '<rootDir>/core/__tests__/types/__typescript__/',
    '<rootDir>/directlinespeech/__tests__/utilities/',
    '<rootDir>/playground/'
  ],
  transform: {
    '\\.m?[jt]sx?$': [
      'babel-jest',
      {
        plugins: ['@babel/plugin-transform-runtime'],
        presets: [
          [
            '@babel/preset-env',
            {
              modules: 'commonjs'
            }
          ],
          '@babel/preset-typescript',
          '@babel/preset-react'
        ]
      }
    ]
  },
  transformIgnorePatterns: [
    // jest-environment-jsdom import packages as browser.
    // Packages, such as "uuid", export itself for browser as ES5 + ESM.
    // Since jest@28 cannot consume ESM yet, we need to transpile these packages.
    `/node_modules/(?!(${TRANSFORM_IGNORE_PACKAGES.join('|')})/)`,
    ...defaults.transformIgnorePatterns.filter(pattern => pattern !== '/node_modules/'),

    // Do not transform anything under /test/*/(dist|lib).
    '/packages/(?:test/)?\\w+/(?:lib/|dist/.+?\\.js$|\\w+\\.js)'
  ]
};
