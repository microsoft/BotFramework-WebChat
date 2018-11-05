import { Builder, By, Key } from 'selenium-webdriver';
import { createServer } from 'http';
import handler from 'serve-handler';
import getPort from 'get-port';
import { promisify } from 'util';

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
  driver = await new Builder().forBrowser('chrome').build();

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

  await input.sendKeys('accessibility', Key.RETURN);
  await sleep(5000);
}, 60000);
