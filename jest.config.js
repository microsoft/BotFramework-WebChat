const { join, relative } = require('path');

module.exports = {
  collectCoverageFrom: [
    '<rootDir>/packages/*/src/**/*.{js,jsx,ts,tsx}',
    '!<rootDir>/*.{spec,test}.{js,jsx,ts,tsx}',
    '!<rootDir>/*.json'
  ],
  coveragePathIgnorePatterns: ['!<rootDir>/node_modules/', '!<rootDir>/packages/playground/', '!<rootDir>/samples/'],
  coverageReporters: ['json', 'lcov', 'text-summary', 'clover', 'cobertura'],
  globals: {
    npm_package_version: '0.0.0-0.jest'
  },
  moduleDirectories: ['node_modules', 'packages'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  modulePathIgnorePatterns: ['<rootDir>/samples/**/*'],
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
              const match = /^See diff for details: (.*)/m.exec(message);

              match && testResultNode.ele('ResultFiles').ele('ResultFile').att('path', match[1]);
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
      './__tests__/__jest__/NUnitTestReporter',
      {
        filename: join(__dirname, 'coverage/nunit3.xml'),
        jestResultFilename: join(__dirname, 'coverage/jest.json')
      }
    ]
  ],
  projects: [
    {
      displayName: 'directlinespeech-sdk',
      modulePathIgnorePatterns: ['<rootDir>/samples/**/*'],
      testMatch: ['<rootDir>/packages/directlinespeech/__tests__/**/*.js'],
      testPathIgnorePatterns: ['<rootDir>/packages/directlinespeech/__tests__/utilities/'],
      transform: {
        '\\.[jt]sx?$': '<rootDir>/packages/directlinespeech/babel-jest-config.js'
      }
    },
    {
      displayName: 'unit-tests',
      modulePathIgnorePatterns: ['<rootDir>/samples/**/*'],
      testMatch: ['<rootDir>/packages/**/*.spec.js', '<rootDir>/packages/**/*.test.js'],
      testPathIgnorePatterns: ['<rootDir>/packages/playground/']
    },
    {
      displayName: 'webchat-html',
      modulePathIgnorePatterns: ['<rootDir>/samples/**/*'],
      setupFilesAfterEnv: ['<rootDir>/__tests__/html/__jest__/perTest/setupAfterEnv.js'],
      testMatch: ['<rootDir>/__tests__/html/**/*.js'],
      testPathIgnorePatterns: [
        '<rootDir>/__tests__/html/__dist__/',
        '<rootDir>/__tests__/html/__jest__/',
        '<rootDir>/__tests__/html/assets/'
      ]
    },
    {
      displayName: 'webchat-webdriver',
      modulePathIgnorePatterns: ['<rootDir>/samples/**/*'],
      setupFilesAfterEnv: ['<rootDir>/__tests__/webdriver/__jest__/perTest/setupAfterEnv.js'],
      testMatch: ['<rootDir>/__tests__/webdriver/**/*.js'],
      testPathIgnorePatterns: ['<rootDir>/__tests__/webdriver/__jest__/']
    }
  ],
  // All tests are configured in the "projects" properties, ignoring the root.
  testMatch: [],
  testPathIgnorePatterns: ['<rootDir>/'],
  transform: {
    '\\.[jt]sx?$': '<rootDir>/babel-jest-config.js'
  }
};
