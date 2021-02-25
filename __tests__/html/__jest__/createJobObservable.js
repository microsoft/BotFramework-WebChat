/* eslint no-await-in-loop: "off" */
/* eslint no-magic-numbers: ["error", { "ignore": [50] }] */
/* global Buffer */

import { promisify } from 'util';
import AbortController from 'abort-controller';
import createDeferred from 'p-defer';
import fs from 'fs';
import kebabCase from 'lodash/kebabCase';
import mkdirp from 'mkdirp';
import Observable from 'core-js/features/observable';
import path from 'path';

import sleep from './sleep';

const ABORT_SYMBOL = Symbol();

const writeFile = promisify(fs.writeFile);

export default function createJobObservable(driver, { ignorePageError = false } = {}) {
  return new Observable(observer => {
    const abortController = new AbortController();
    const abortPromise = new Promise(resolve =>
      abortController.signal.addEventListener('abort', () => resolve(ABORT_SYMBOL))
    );

    (async function () {
      for (;;) {
        const job = await Promise.race([driver.executeScript(() => window.WebChatTest.jobs.acquire()), abortPromise]);

        if (!job) {
          await sleep(50);
          continue;
        }

        if (job === ABORT_SYMBOL) {
          break;
        } else if (job.type === 'done') {
          if (job.payload.deprecation) {
            const deferred = createDeferred();

            observer.next({
              deferred,
              job: {
                type: 'expect deprecation'
              }
            });

            if (!(await deferred.promise)) {
              return observer.error(new Error('Expected deprecation notes were not found in the console log.'));
            }
          }

          observer.complete();
          break;
        } else if (job.type === 'error') {
          const { currentTestName, testPath } = expect.getState();

          const errorScreenshotFilename = path.join(
            path.dirname(testPath),
            '../__image_snapshots__/html/__diff_output__',
            `${kebabCase(`${path.basename(testPath)}-${currentTestName}`)}-error.png`
          );

          const screenshot = await driver.takeScreenshot();

          mkdirp.sync(path.dirname(errorScreenshotFilename));

          await writeFile(errorScreenshotFilename, Buffer.from(screenshot, 'base64'));

          observer.error(
            new Error(
              `Unhandled exception from the test code on the page.\nSee diff for details: ${errorScreenshotFilename}\n\n${job.payload.error.stack}`
            )
          );

          break;
        } else if (job.type === 'pageerror') {
          if (!ignorePageError) {
            observer.error(new Error(`The page emitted an "error" event.\n\n${job.payload.error.stack}`));
            break;
          }
        } else {
          const deferred = createDeferred();

          observer.next({
            deferred,
            job
          });

          await deferred.promise.then(
            (result = null) =>
              driver.executeScript((id, result) => window.WebChatTest.jobs.resolve(id, result), job.id, result),
            async error => {
              await driver.executeScript(
                (id, stack) => window.WebChatTest.jobs.reject(id, new Error(stack)),
                job.id,
                error.stack
              );

              observer.error(error);
            }
          );
        }
      }
    }());

    return () => abortController.abort();
  });
}
