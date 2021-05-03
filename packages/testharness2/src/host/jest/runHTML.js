/* istanbul ignore file */
const allocateWebDriver = require('./allocateWebDriver');
const createProxies = require('../common/createProxies');
const dumpLogs = require('../dev/utils/dumpLogs');
const mergeCoverageMap = require('./mergeCoverageMap');
const registerProxies = require('../common/registerProxies');
const sleep = require('../../common/utils/sleep');

const DEFAULT_OPTIONS = {
  webDriverURL: 'http://localhost:4445/wd/hub/'
};

afterEach(async () => {
  try {
    // We must stop the bridge too, otherwise, it will cause timeout.
    global.webDriverBridge && global.webDriverBridge.close();
  } catch (err) {}

  global.__operation__ && console.log(`Last operation was ${global.__operation__}`);

  const { webDriver } = global;

  if (webDriver) {
    try {
      await dumpLogs(webDriver);
    } catch (err) {}

    try {
      // Exceptions thrown in setup() will still trigger afterEach(), such as timeout.
      await webDriver.quit();
    } catch (err) {}
  }
});

global.runHTML = async function runHTML(url, options = DEFAULT_OPTIONS) {
  options = { ...DEFAULT_OPTIONS, ...options };

  // We are assigning it to "global.webDriver" to allow Environment.teardown to terminate it if needed.
  const webDriver = (global.webDriver = await allocateWebDriver(options));

  try {
    const absoluteURL = new URL(url, 'http://webchat2/__tests__/html2/');

    global.__operation__ = `loading URL ${absoluteURL.toString()}`;

    await webDriver.get(absoluteURL);

    global.__operation__ = 'setting window size to 360x640';

    await webDriver.manage().window().setRect({ height: 640, width: 360 });

    global.__operation__ = 'setting class name for body element';

    await webDriver.executeScript(() => {
      document.body.className = 'jest';
    });

    const proxies = createProxies(webDriver);

    global.webDriverBridge = registerProxies(webDriver, proxies);

    global.__operation__ = 'waiting for the bridge to ready';

    // Wait until the page is loaded. This will generate a better errors.
    await expect(proxies.host.readyPromise).resolves.toBeUndefined();

    // Wait until test call done() or errored out.
    await expect(proxies.host.donePromise).resolves.toBeUndefined();

    const postCoverage = await webDriver.executeScript(() => window.__coverage__);

    // Merge code coverage result.
    global.__coverage__ = mergeCoverageMap(global.__coverage__, postCoverage);
    global.__operation__ = undefined;
  } finally {
    // After the done.promise is resolved or rejected, before terminating the Web Driver session, we need to wait a bit longer for the RPC callback to complete.
    // Otherwise, the RPC return call will throw "NoSuchSessionError" because the session was killed.
    await sleep(100);
  }
};
