/* istanbul ignore file */
const allocateWebDriver = require('./allocateWebDriver');
const mergeCoverageMap = require('./mergeCoverageMap');
const registerProxies = require('../common/registerProxies');
const createProxies = require('../common/createProxies');

const WEB_DRIVER_URL = 'http://localhost:4444/wd/hub/';

const DEFAULT_OPTIONS = {
  webDriverURL: WEB_DRIVER_URL
};

global.runHTML = async function runHTML(url, options = DEFAULT_OPTIONS) {
  options = { ...DEFAULT_OPTIONS, ...options };

  // We are assigning it to "global.webDriver" to allow Environment.teardown to terminate it if needed.
  const webDriver = (global.webDriver = await allocateWebDriver(options));

  try {
    const absoluteURL = new URL(url, 'http://webchat2/__tests__/html2/');

    global.__operation__ = `loading URL ${absoluteURL.toString()}`;

    await webDriver.get(absoluteURL);

    const proxies = createProxies(webDriver);

    global.webDriverBridge = registerProxies(webDriver, proxies);

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
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};
