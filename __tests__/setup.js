import { Builder, By, Key } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { createServer } from 'http';
import { promisify } from 'util';
import getPort from 'get-port';
import handler from 'serve-handler';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

let driver;
let server;

function createWebChatBundleServer() {
  return new Promise(async (resolve, reject) => {
    const port = await getPort();
    const httpServer = createServer((req, res) => handler(req, res, {
      rewrites: [
        { source: '/webchat.js', destination: 'packages/bundle/dist/webchat.js' },
        { source: '/webchat-es5.js', destination: 'packages/bundle/dist/webchat-es5.js' },
        { source: '/webchat-minimal.js', destination: 'packages/bundle/dist/webchat-minimal.js' }
      ]
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

function sleep(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

beforeAll(async () => {
  server = await createWebChatBundleServer();
});

beforeEach(async () => {
  let builder = new Builder().forBrowser('chrome');
  const chromeOptions = (builder.getChromeOptions() || new ChromeOptions()).windowSize({ height: 640, width: 360 });

  builder = builder.setChromeOptions(chromeOptions);
  driver = await builder.build();

  await driver.get(`http://localhost:${ server.port }/samples/full-bundle`);
}, 10000);

afterEach(async () => {
  if (driver) {
    try {
      global.__coverage__ = await driver.executeScript(() => window.__coverage__);
    } finally {
      await driver.quit();
    }
  }
});

afterAll(async () => {
  if (server) {
    await server.close();
  }
});

test('setup', async () => {
  await sleep(2000);

  const input = await driver.findElement(By.tagName('input[type="text"]'));

  await input.sendKeys('layout carousel', Key.RETURN);
  await sleep(5000);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot();
}, 60000);
