import { Builder } from 'selenium-webdriver';
import { createServer } from 'http';
import { join } from 'path';
import { promisify } from 'util';
import { configureToMatchImageSnapshot } from 'jest-image-snapshot';
import getPort from 'get-port';
import handler from 'serve-handler';

import setupTestEnvironment from './setupTestEnvironment';

const BROWSER_NAME = process.env.WEBCHAT_TEST_ENV || 'chrome-docker';
// const BROWSER_NAME = 'chrome-docker';
// const BROWSER_NAME = 'chrome-local';

expect.extend({
  toMatchImageSnapshot: configureToMatchImageSnapshot({
    customSnapshotsDir: join(__dirname, '../__image_snapshots__', BROWSER_NAME)
  })
});

let driverPromise;
let serverPromise;

global.setupWebDriver = async () => {
  if (!driverPromise) {
    driverPromise = (async () => {
      let { baseURL, builder } = await setupTestEnvironment(BROWSER_NAME, new Builder());
      const driver = builder.build();

      // If the baseURL contains $PORT, it means it requires us to fill-in
      if (/\$PORT/i.test(baseURL)) {
        const { port } = await global.setupWebServer();

        await driver.get(baseURL.replace(/\$PORT/ig, port));
      } else {
        await driver.get(baseURL);
      }

      return { driver };
    })();
  }

  return await driverPromise;
};

global.setupWebServer = async () => {
  if (!serverPromise) {
    serverPromise = new Promise(async (resolve, reject) => {
      const port = await getPort();
      const httpServer = createServer((req, res) => handler(req, res, {
        redirects: [
          { source: '/', destination: '__tests__/setup/web/index.html' }
        ],
        rewrites: [
          { source: '/webchat.js', destination: 'packages/bundle/dist/webchat.js' },
          { source: '/webchat-es5.js', destination: 'packages/bundle/dist/webchat-es5.js' },
          { source: '/webchat-instrumented.js', destination: 'packages/bundle/dist/webchat-instrumented.js' },
          { source: '/webchat-instrumented-es5.js', destination: 'packages/bundle/dist/webchat-instrumented-es5.js' },
          { source: '/webchat-instrumented-minimal.js', destination: 'packages/bundle/dist/webchat-instrumented-minimal.js' },
          { source: '/webchat-minimal.js', destination: 'packages/bundle/dist/webchat-minimal.js' }
        ],
        public: join(__dirname, '../..'),
      }));

      httpServer.once('error', reject);

      httpServer.listen(port, () => {
        resolve({
          close: promisify(httpServer.close.bind(httpServer)),
          port
        });
      });
    });
  }

  return await serverPromise;
}

afterEach(async () => {
  if (driverPromise) {
    const { driver } = await driverPromise;

    try {
      global.__coverage__ = await driver.executeScript(() => window.__coverage__);

      ((await driver.executeScript(() => window.__console__)) || [])
        .filter(([type]) => type !== 'info' && type !== 'log')
        .forEach(([type, message]) => {
          console.log(`${ type }: ${ message }`);
        });
    } finally {
      await driver.quit();
    }
  }
});

afterAll(async () => {
  if (serverPromise) {
    const { close } = await serverPromise;

    await close();
  }
});
