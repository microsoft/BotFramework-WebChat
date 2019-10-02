import { Builder } from 'selenium-webdriver';
import { configureToMatchImageSnapshot } from 'jest-image-snapshot';
import { createServer } from 'http';
import { join } from 'path';
import { promisify } from 'util';
import getPort from 'get-port';
import handler from 'serve-handler';

import createPageObjects from './pageObjects/index';
import marshal from './marshal';
import retry from './retry';
import setupTestEnvironment from './setupTestEnvironment';

const BROWSER_NAME = process.env.WEBCHAT_TEST_ENV || 'chrome-docker';
// const BROWSER_NAME = 'chrome-docker';
// const BROWSER_NAME = 'chrome-local';
const NUM_RETRIES = 3;

expect.extend({
  toMatchImageSnapshot: configureToMatchImageSnapshot({
    customSnapshotsDir: join(__dirname, '../__image_snapshots__', BROWSER_NAME)
  })
});

let driverPromise;
let serverPromise;

const DEFAULT_OPTIONS = {
  pingBotOnLoad: true
};

global.setupWebDriver = async options => {
  options = { ...DEFAULT_OPTIONS, ...options };

  if (!driverPromise) {
    driverPromise = retry(async () => {
      let { baseURL, builder } = await setupTestEnvironment(BROWSER_NAME, new Builder(), options);
      const driver = builder.build();

      try {
        // If the baseURL contains $PORT, it means it requires us to fill-in
        if (/\$PORT/i.test(baseURL)) {
          const { port } = await global.setupWebServer();

          await driver.get(baseURL.replace(/\$PORT/gi, port));
        } else {
          await driver.get(baseURL);
        }

        await driver.executeAsyncScript(
          (coverage, options, callback) => {
            window.__coverage__ = coverage;

            if (options.zoom) {
              document.body.style.zoom = options.zoom;
            }

            main(options).then(
              () => callback(),
              err => {
                console.error(err);
                callback(err);
              }
            );
          },
          global.__coverage__,
          marshal({
            ...options,
            props: marshal(options.props)
          })
        );

        const pageObjects = createPageObjects(driver);

        options.pingBotOnLoad && (await pageObjects.pingBot());

        return { driver, pageObjects };
      } catch (err) {
        await driver.quit();

        throw err;
      }
    }, NUM_RETRIES);
  }

  return await driverPromise;
};

global.setupWebServer = async () => {
  if (!serverPromise) {
    serverPromise = new Promise(async (resolve, reject) => {
      const port = await getPort();
      const httpServer = createServer((req, res) =>
        handler(req, res, {
          redirects: [
            { source: '/', destination: '__tests__/setup/web/index.html' },
            {
              source: '/createProduceConsumeBroker.js',
              destination: '__tests__/setup/web/createProduceConsumeBroker.js'
            },
            { source: '/mockWebSpeech.js', destination: '__tests__/setup/web/mockWebSpeech.js' }
          ],
          rewrites: [
            { source: '/webchat.js', destination: 'packages/bundle/dist/webchat.js' },
            { source: '/webchat-es5.js', destination: 'packages/bundle/dist/webchat-es5.js' },
            { source: '/webchat-instrumented.js', destination: 'packages/bundle/dist/webchat-instrumented.js' },
            { source: '/webchat-instrumented-es5.js', destination: 'packages/bundle/dist/webchat-instrumented-es5.js' },
            {
              source: '/webchat-instrumented-minimal.js',
              destination: 'packages/bundle/dist/webchat-instrumented-minimal.js'
            },
            { source: '/webchat-minimal.js', destination: 'packages/bundle/dist/webchat-minimal.js' }
          ],
          public: join(__dirname, '../..')
        })
      );

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
};

afterEach(async () => {
  if (driverPromise) {
    const { driver } = await driverPromise;

    try {
      global.__coverage__ = await driver.executeScript(() => window.__coverage__);

      ((await driver.executeScript(() => window.__console__)) || [])
        .filter(([type]) => type === 'error' && type === 'warn')
        .forEach(([type, message]) => {
          console.log(`${type}: ${message}`);
        });
    } finally {
      await driver.quit();
      driverPromise = null;
    }
  }
});

afterAll(async () => {
  if (serverPromise) {
    const { close } = await serverPromise;

    await close();
  }
});
