const { defaults } = require('jest-config');
const { join, relative } = require('path');

const TRANSFORM_IGNORE_PACKAGES = [
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
  collectCoverageFrom: [
    '<rootDir>/packages/*/src/**/*.{js,jsx,ts,tsx}',
    '!<rootDir>/*.{spec,test}.{js,jsx,ts,tsx}',
    '!<rootDir>/*.json',
    '!<rootDir>/node_modules/**',
    '!<rootDir>/packages/playground/**',
    '!<rootDir>/samples/**'
  ],
  coverageReporters: ['json', 'lcov', 'text-summary', 'clover', 'cobertura'],
  globals: {
    npm_package_version: '0.0.0-0.jest'
  },
  // We only have 4 instances of Chromium running simultaneously.
  maxWorkers: 4,
  moduleDirectories: ['node_modules', 'packages'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        ancestorSeparator: ' › ',
        classNameTemplate: '{filepath}',
        includeConsoleOutput: true,
        outputDirectory: 'coverage',
        suiteName: 'BotFramework-WebChat',
        titleTemplate: ({ classname, filename, title }) =>
          [filename, classname, title]
            .map(value => (value || '').trim())
            .filter(value => value)
            .join(' › ')
      }
    ],
    [
      'jest-trx-results-processor',
      {
        outputFile: 'coverage/result.trx',
        postProcessTestResult: [
          (testSuiteResult, testResult, testResultNode) => {
            // If you want to re-touch the test result, you can refer to source code from these links:
            // - https://github.com/facebook/jest/blob/master/packages/jest-types/src/TestResult.ts
            // - https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/test/publish-test-results?view=azure-devops&tabs=yaml#attachments-support
            // - https://github.com/Microsoft/vstest/tree/master/src/Microsoft.TestPlatform.Extensions.TrxLogger
            // - https://github.com/no23reason/jest-trx-results-processor/tree/master/src

            testResult.failureMessages.forEach(message => {
              const pattern = /See (diff|screenshot) for details: (.*)/gmu;

              for (;;) {
                const match = pattern.exec(message);

                if (!match) {
                  break;
                }

                testResultNode.ele('ResultFiles').ele('ResultFile').att('path', match[2]);
              }
            });

            testResultNode.att(
              'testName',
              `${relative(__dirname, testSuiteResult.testFilePath)} › ${testResult.fullName}`
            );
          }
        ]
      }
    ],
    [
      './__tests__/setup/NUnitTestReporter',
      {
        filename: join(__dirname, 'coverage/nunit3.xml'),
        jestResultFilename: join(__dirname, 'coverage/jest.json')
      }
    ],
    [
      'github-actions',
      {
        silent: false
      }
    ]
  ],
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/setup/setupDotEnv.js',
    '<rootDir>/__tests__/setup/setupGlobalAgent.js',
    '<rootDir>/__tests__/setup/preSetupTestFramework.js',
    '<rootDir>/__tests__/setup/setupCryptoGetRandomValues.js',
    '<rootDir>/__tests__/setup/setupImageSnapshot.js',
    '<rootDir>/__tests__/setup/setupTestNightly.js',
    '<rootDir>/__tests__/setup/setupTimeout.js'
  ],
  testPathIgnorePatterns: [
    '/lib/',
    '/node_modules/',
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
    '\\.[jt]sx?$': './babel-jest-config.js'
  },
  transformIgnorePatterns: [
    // jest-environment-jsdom import packages as browser.
    // Packages, such as "uuid", export itself for browser as ES5 + ESM.
    // Since jest@28 cannot consume ESM yet, we need to transpile these packages.
    `/node_modules/(?!(${TRANSFORM_IGNORE_PACKAGES.join('|')})/)`,
    ...defaults.transformIgnorePatterns.filter(pattern => pattern !== '/node_modules/')
  ]
};
