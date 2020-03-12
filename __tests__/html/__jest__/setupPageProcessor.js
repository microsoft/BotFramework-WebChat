import { configureToMatchImageSnapshot } from 'jest-image-snapshot';
import { join } from 'path';

import { imageSnapshotOptions } from '../../constants.json';

function sleep(durationInMS = 100) {
  return new Promise(resolve => setTimeout(resolve, durationInMS));
}

const toMatchImageSnapshot = configureToMatchImageSnapshot({
  ...imageSnapshotOptions,
  customSnapshotsDir: join(__dirname, '../../__image_snapshots__/html')
});

expect.extend({
  async toRunToCompletion(driver) {
    const webChatLoaded = await driver.executeScript(() => !!window.WebChat);
    const webChatTestLoaded = await driver.executeScript(() => !!window.WebChatTest);

    if (!webChatLoaded) {
      throw new Error('"webchat.js" is not loaded on the page.');
    }

    if (!webChatTestLoaded) {
      throw new Error('"testharness.js" is not loaded on the page.');
    }

    if (await driver.executeScript(() => !(window.React && window.ReactDOM && window.ReactTestUtils))) {
      throw new Error(
        '"react", "react-dom", and "react-test-utils" is required to use page objects and must be loaded on the page.'
      );
    }

    const abortPromise = new Promise(resolve =>
      global.abortSignal.addEventListener('abort', () => resolve({ type: 'abort' }))
    );

    let numConsoleError = 0;

    for (;;) {
      const result = await Promise.race([driver.executeScript(() => window.WebChatTest.jobs.acquire()), abortPromise]);

      if (!result) {
        await sleep(50);
        continue;
      }

      const { id, type } = result;

      if (type === 'abort') {
        // Jest will complain if failing after teardown, saying "Caught error after test environment was torn down".
        return { pass: true };
      } else if (type === 'console') {
        const { args, level } = result.payload;
        const message = args.join(' ');

        // Do not print Babel warning "You are using the in-browser Babel transformer. Be sure to precompile your scripts for production - https://babeljs.io/docs/setup/".
        if (!~message.indexOf('in-browser Babel transformer')) {
          console.log(`[${level}] ${message}`);
        }

        if (level === 'error') {
          numConsoleError++;
        }
      } else if (type === 'done') {
        if (!result.payload.ignoreConsoleError && numConsoleError) {
          return {
            message: () =>
              this.utils.matcherHint('toRunToCompletion', undefined, undefined, {
                comment:
                  'run to completion without any console.error, set { ignoreConsoleError: true } if console.error is okay to ignore',
                isNot: this.isNot,
                promise: this.promise
              }),
            pass: false
          };
        }

        return {
          message: () =>
            this.utils.matcherHint('toRunToCompletion', undefined, undefined, {
              comment: result.payload.ignoreConsoleError
                ? 'run to completion and ignore any console.error'
                : 'run to completion without any console.error',
              isNot: this.isNot,
              promise: this.promise
            }),
          pass: true
        };
      } else if (type === 'error') {
        throw new Error(`The page emitted an "error" event. ${result.payload.error}`);
      } else if (type === 'snapshot') {
        const result = toMatchImageSnapshot.call(this, await driver.takeScreenshot());

        if (!result.pass) {
          return result;
        }

        await driver.executeScript(id => window.WebChatTest.jobs.resolve(id), id);
      }
    }
  }
});
