// const { relative } = require('path');

module.exports = {
  collectCoverageFrom: ['<rootDir>/packages/*/src/**/*.{js,jsx,ts,tsx}'],
  coverageReporters: ['json', 'lcov', 'text-summary', 'clover', 'cobertura'],
  // We only have 4 instances of Chromium running simultaneously.
  maxWorkers: 4,
  projects: ['<rootDir>/__tests__/html2.setup/jest.config.js', '<rootDir>/__tests__/unit.setup/jest.config.js'],
  reporters: [
    'default',
    // [
    //   'jest-junit',
    //   {
    //     ancestorSeparator: ' › ',
    //     classNameTemplate: '{filepath}',
    //     includeConsoleOutput: true,
    //     outputDirectory: 'coverage',
    //     suiteName: 'BotFramework-WebChat',
    //     titleTemplate: ({ classname, filename, title }) =>
    //       [filename, classname, title]
    //         .map(value => (value || '').trim())
    //         .filter(value => value)
    //         .join(' › ')
    //   }
    // ],
    // [
    //   'jest-trx-results-processor',
    //   {
    //     outputFile: 'coverage/result.trx',
    //     postProcessTestResult: [
    //       (testSuiteResult, testResult, testResultNode) => {
    //         // If you want to re-touch the test result, you can refer to source code from these links:
    //         // - https://github.com/facebook/jest/blob/master/packages/jest-types/src/TestResult.ts
    //         // - https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/test/publish-test-results?view=azure-devops&tabs=yaml#attachments-support
    //         // - https://github.com/Microsoft/vstest/tree/master/src/Microsoft.TestPlatform.Extensions.TrxLogger
    //         // - https://github.com/no23reason/jest-trx-results-processor/tree/master/src

    //         testResult.failureMessages.forEach(message => {
    //           const pattern = /See (diff|screenshot) for details: (.*)/gmu;

    //           for (;;) {
    //             const match = pattern.exec(message);

    //             if (!match) {
    //               break;
    //             }

    //             testResultNode.ele('ResultFiles').ele('ResultFile').att('path', match[2]);
    //           }
    //         });

    //         testResultNode.att(
    //           'testName',
    //           `${relative(__dirname, testSuiteResult.testFilePath)} › ${testResult.fullName}`
    //         );
    //       }
    //     ]
    //   }
    // ],
    ['github-actions', { silent: false }]
  ]
};
