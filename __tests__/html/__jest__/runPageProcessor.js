import { join } from 'path';
import { Key } from 'selenium-webdriver';
import { promisify } from 'util';
import { tmpdir } from 'os';
import createDeferred from 'p-defer';
import fs from 'fs';

import { imageSnapshotOptions } from '../../constants.json';
import createJobObservable from './createJobObservable';

const customImageSnapshotOptions = {
  ...imageSnapshotOptions,
  customSnapshotsDir: join(__dirname, '../../__image_snapshots__/html')
};

const writeFile = promisify(fs.writeFile);

export default async function runPageProcessor(driver, { ignoreConsoleError = false, ignorePageError = false } = {}) {
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
        pageResultDeferred.reject(
          new Error(
            'console.error() was called in browser. Set { ignoreConsoleError: true } if console.error is okay to ignore'
          )
        );
      } else {
        pageResultDeferred.resolve();
      }
    },
    error: error => {
      pageResultDeferred.reject(error);
    },
    next: async ({ deferred, job }) => {
      try {
        let result;

        if (job.type === 'send keys') {
          await job.payload.keys
            .reduce((actions, key) => actions.sendKeys(Key[key] || key), driver.actions())
            .perform();
        } else if (job.type === 'send tab') {
          await driver
            .actions()
            .sendKeys(Key.TAB)
            .perform();
        } else if (job.type === 'send shift tab') {
          await driver
            .actions()
            .keyDown(Key.SHIFT)
            .sendKeys(Key.TAB)
            .keyUp(Key.SHIFT)
            .perform();
        } else if (job.type === 'snapshot') {
          expect(await driver.takeScreenshot()).toMatchImageSnapshot(customImageSnapshotOptions);
        } else if (job.type === 'save file') {
          const filename = join(tmpdir(), `${Date.now()}-${job.payload.filename}`);

          await writeFile(filename, Buffer.from(job.payload.base64, 'base64'));

          console.log(`Saved to ${filename}`);

          result = filename;
        } else {
          throw new Error(`Unknown job type "${job.type}".`);
        }

        deferred.resolve(result);
      } catch (err) {
        pageResultDeferred.reject(err);
        deferred.reject(err);
      }
    }
  });

  global.abortSignal.addEventListener('abort', () => pageResultDeferred.reject(new Error('Test aborted.')));

  try {
    return await pageResultDeferred.promise;
  } finally {
    subscription.unsubscribe();
  }
}
