// Articles related to this work:
// https://github.com/facebook/jest/blob/master/packages/jest-reporters/src/types.ts
// https://github.com/facebook/jest/blob/master/packages/jest-types/src/TestResult.ts
// https://github.com/nunit/docs/wiki/Test-Result-XML-Format

const { basename, join, relative } = require('path');
const { writeFileSync } = require('fs');
const { createHash } = require('crypto');
const builder = require('xmlbuilder');
const ErrorStackParser = require('error-stack-parser');
const os = require('os');
const stripANSI = require('strip-ansi');

const hash = value => {
  const hash = createHash('sha1');

  hash.update(value);

  return hash.digest('hex').substr(0, 5);
};

class NUnitTestReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunComplete(contexts, results) {
    const {
      numFailedTestSuites,
      numFailedTests,
      numPassedTestSuites,
      numPassedTests,
      numPendingTestSuites,
      numPendingTests,
      numRuntimeErrorTestSuites,
      numTodoTests,
      numTotalTestSuites,
      numTotalTests,
      openHandles,
      snapshot,
      startTime,
      success,
      testResults,
      wasInterrupted
    } = results;

    const xml = {
      'test-run': {
        '@id': Date.now(),
        '@testcasecount': 0,
        '@result': success ? 'Passed' : 'Failed',
        '@total': 0,
        '@passed': 0,
        '@failed': 0,
        '@inconclusive': 0,
        '@skipped': 0,
        '@asserts': 0,
        '@engine-version': require('jest/package.json').version,
        '@clr-version': process.version,
        '@start-time': new Date(0).toISOString(),
        '@end-time': new Date(0).toISOString(),
        '@duration': 0,
        'test-suite': testResults.map(({ // console,
          // failureMessage,
          numFailingTests, numPassingTests, numPendingTests, numTodoTests, perfStats: { end, start }, skipped, testFilePath, testResults }) => ({
          '@type': 'Assembly',
          '@id': hash(testFilePath),
          '@name': basename(testFilePath),
          '@fullname': relative(join(__dirname, '..', '..'), testFilePath),
          '@testcasecount': numFailingTests + numPassingTests + numPendingTests + numTodoTests,
          '@runstate': skipped ? 'Skipped' : 'Runnable',
          '@label': '',
          '@start-time': new Date(start).toISOString(),
          '@end-time': new Date(end).toISOString(),
          '@duration': (end - start) / 1000,
          '@total': numFailingTests + numPassingTests + numTodoTests,
          '@passed': numPassingTests,
          '@failed': numFailingTests,
          '@inconclusive': 0,
          '@skipped': numPendingTests + numTodoTests,
          '@asserts': 0,
          environment: {
            '@framework-version': require('jest/package.json').version,
            '@clr-version': process.version,
            '@os-version': os.release(),
            '@platform': os.platform(),
            '@cwd': process.cwd(),
            '@machine-name': os.hostname(),
            '@user': os.userInfo().username,
            '@user-domain': '',
            '@culture': '',
            '@uiculture': '',
            '@os-architecture': os.arch()
          },
          settings: [],
          properties: [],
          reason: {},
          failure: {},
          output: {},
          attachments: [],
          'test-case': testResults.map(
            ({
              // ancestorTitles,
              duration,
              failureMessages,
              fullName,
              numPassingAsserts,
              status,
              title
            }) => {
              let error;

              if (status === 'failed') {
                error = new Error();
                error.stack = failureMessages.map(stripANSI).join('');
              }

              const filename = relative(join(__dirname, '..', '..'), testFilePath);
              const attachments = [];

              // See diff for details: C:\Users\Compulim\Source\Repos\BotFramework-WebChat.buddy5\__tests__\__image_snapshots__\chrome-docker\__diff_output__\video-js-video-1-diff.png

              failureMessages.forEach(message => {
                const [_, filename] = /^See diff for details: (.*)/m.exec(stripANSI(message)) || [];

                filename &&
                  attachments.push({
                    attachment: {
                      filePath: filename,
                      description: basename(filename)
                    }
                  });
              });

              return {
                // location,
                '@id': `${hash(testFilePath)}-${hash(title)}`,
                '@name': `${filename} › ${title}`,
                '@fullname': `${filename} › ${fullName}`,
                '@methodname': `${filename} › ${title}`,
                '@runstate': 'Runnable',
                '@seed': 0,
                '@result': status === 'pending' ? 'Skipped' : status === 'passed' ? 'Passed' : 'Failed',
                '@site': 'Test',
                '@start-time': new Date(start).toISOString(),
                '@end-time': new Date(start + duration).toISOString(),
                '@duration': duration / 1000,
                '@asserts': numPassingAsserts,
                properties: {},
                reason: {},
                failure:
                  status === 'passed'
                    ? {}
                    : {
                        message: {
                          '#cdata-section': failureMessages.map(stripANSI).join('\n')
                        },
                        'stack-trace': {
                          '#cdata-section': error
                            ? ErrorStackParser.parse(error)
                                .map(stackFrame => {
                                  stackFrame.setFileName(
                                    relative(join(__dirname, '..', '..'), stackFrame.fileName || '.')
                                  );

                                  return stackFrame + '';
                                })
                                .join('\n')
                            : ''
                        }
                      },
                output: {},
                attachments
              };
            }
          )
        }))
      }
    };

    const { minStartTime, maxEndTime } = xml['test-run']['test-suite'].reduce(
      ({ minStartTime, maxEndTime }, { '@start-time': startTime, '@end-time': endTime }) => ({
        minStartTime: Math.min(minStartTime, new Date(startTime).getTime()),
        maxEndTime: Math.max(maxEndTime, new Date(endTime).getTime())
      }),
      { minStartTime: Infinity, maxEndTime: -Infinity }
    );

    if (isFinite(minStartTime) && isFinite(maxEndTime)) {
      xml['test-run']['@start-time'] = new Date(minStartTime).toISOString();
      xml['test-run']['@end-time'] = new Date(maxEndTime).toISOString();
      xml['test-run']['@duration'] = Math.max(0, maxEndTime - minStartTime) / 1000;
    }

    xml['test-run']['test-suite'] = xml['test-run']['test-suite'].map(testSuite => {
      const { 'test-case': testCases } = testSuite;

      return {
        ...testSuite,
        failure: {
          message: testCases
            .filter(({ '@result': result }) => result === 'Failed')
            .map(
              ({
                failure: {
                  message: { '#cdata-section': text }
                }
              }) => text
            )
            .join('\n')
            .trim()
        },
        ...testCases.reduce(
          (
            {
              '@testcasecount': testCaseCount,
              '@total': total,
              '@passed': passed,
              '@failed': failed,
              '@inconclusive': inconclusive,
              '@skipped': skipped,
              '@asserts': totalAsserts
            },
            { '@asserts': asserts, '@result': result }
          ) => ({
            '@testcasecount': testCaseCount + 1,
            '@total': total + 1,
            '@passed': passed + (result === 'Passed' ? 1 : 0),
            '@failed': failed + (result === 'Failed' ? 1 : 0),
            '@inconclusive': inconclusive,
            '@skipped': skipped + (result === 'Skipped' ? 1 : 0),
            '@asserts': totalAsserts + asserts
          }),
          {
            '@testcasecount': 0,
            '@total': 0,
            '@passed': 0,
            '@failed': 0,
            '@inconclusive': 0,
            '@skipped': 0,
            '@asserts': 0
          }
        )
      };
    });

    xml['test-run'] = {
      ...xml['test-run'],
      ...xml['test-run']['test-suite'].reduce(
        (
          {
            '@testcasecount': totalTestCaseCount,
            '@total': totalTotal,
            '@passed': totalPassed,
            '@failed': totalFailed,
            '@inconclusive': totalInconclusive,
            '@skipped': totalSkipped,
            '@asserts': totalAsserts
          },
          {
            '@testcasecount': testCaseCount,
            '@total': total,
            '@passed': passed,
            '@failed': failed,
            '@inconclusive': inconclusive,
            '@skipped': skipped,
            '@asserts': asserts
          }
        ) => ({
          '@testcasecount': totalTestCaseCount + testCaseCount,
          '@total': totalTotal + total,
          '@passed': totalPassed + passed,
          '@failed': totalFailed + failed,
          '@inconclusive': totalInconclusive + inconclusive,
          '@skipped': totalSkipped + skipped,
          '@asserts': totalAsserts + asserts
        }),
        {
          '@testcasecount': 0,
          '@total': 0,
          '@passed': 0,
          '@failed': 0,
          '@inconclusive': 0,
          '@skipped': 0,
          '@asserts': 0
        }
      )
    };

    // console.log(JSON.stringify(xml, null, 2));

    this._options.jestResultFilename &&
      writeFileSync(this._options.jestResultFilename, JSON.stringify({ results }, null, 2));

    writeFileSync(this._options.filename, builder.create(xml).end({ pretty: true }));
  }
}

module.exports = NUnitTestReporter;
