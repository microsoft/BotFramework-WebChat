import { configureToMatchImageSnapshot } from 'jest-image-snapshot';
import { join } from 'path';
import createDeferred from 'p-defer';

import { imageSnapshotOptions } from '../../constants.json';
import createJobObservable from './createJobObservable';

const toMatchImageSnapshot = configureToMatchImageSnapshot({
  ...imageSnapshotOptions,
  customSnapshotsDir: join(__dirname, '../../__image_snapshots__/html')
});

expect.extend({
  async toRunToCompletion(driver, { ignoreConsoleError = false, ignorePageError = false } = {}) {
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

    const jobObservable = createJobObservable(driver, { ignorePageError });
    const pageResultDeferred = createDeferred();

    const subscription = jobObservable.subscribe({
      complete: async () => {
        const numConsoleError = await driver.executeScript(
          () => window.WebChatTest.getConsoleHistory().filter(({ level }) => level === 'error').length
        );

        if (!ignoreConsoleError && numConsoleError) {
          pageResultDeferred.resolve({
            message: () =>
              this.utils.matcherHint('toRunToCompletion', undefined, undefined, {
                comment:
                  'run to completion without any console.error, set { ignoreConsoleError: true } if console.error is okay to ignore',
                isNot: this.isNot,
                promise: this.promise
              }),
            pass: false
          });
        } else {
          pageResultDeferred.resolve({
            message: () =>
              this.utils.matcherHint('toRunToCompletion', undefined, undefined, {
                comment: payload.ignoreConsoleError
                  ? 'run to completion and ignore any console.error'
                  : 'run to completion without any console.error',
                isNot: this.isNot,
                promise: this.promise
              }),
            pass: true
          });
        }
      },
      error: error => {
        pageResultDeferred.reject(error);
      },
      next: async ({ deferred, job }) => {
        try {
          if (job.type === 'snapshot') {
            const result = toMatchImageSnapshot.call(this, await driver.takeScreenshot());

            if (result.pass) {
              deferred.resolve();
            } else {
              pageResultDeferred.resolve(result);
              deferred.reject(new Error(typeof result.message === 'function' ? result.message() : result.message));
            }
          } else {
            throw new Error(`Unknown job type "${job.type}".`);
          }
        } catch (err) {
          deferred.reject(err);
        }
      }
    });

    global.abortSignal.addEventListener('abort', () => pageResultDeferred.resolve({ pass: true }));

    const result = await pageResultDeferred.promise;

    subscription.unsubscribe();

    return result;
  }
});
