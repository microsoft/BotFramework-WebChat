/* istanbul ignore file */
const { basename, join } = require('path');
const { tmpdir } = require('os');
const { writeFile } = require('fs').promises;
const allocateWebDriver = require('./allocateWebDriver');
const createProxies = require('../common/createProxies');
const dumpLogs = require('../common/dumpLogs');
const mergeCoverageMap = require('./mergeCoverageMap');
const registerProxies = require('../common/registerProxies');
const sleep = require('../../common/utils/sleep');

const DEFAULT_OPTIONS = {
  webDriverURL: 'http://localhost:4445/wd/hub/'
};

// The provider set of Web Chat for every page: "redux" or "default" (no Redux, internal and for tests only).
// Pages read it with `testHelpers.getStoreMode()`, from the "webchat-test-store-mode" parameter of the URL fragment.
// (Not the search: the server redirects "page.html?search" to "page" without the search; the fragment is kept.)
const STORE_MODE = process.env.WEBCHAT_TEST_STORE_MODE;

if (STORE_MODE && !['default', 'redux'].includes(STORE_MODE)) {
  throw new Error(`WEBCHAT_TEST_STORE_MODE must be "default" or "redux", not "${STORE_MODE}".`);
}

afterEach(async () => {
  try {
    // We must stop the bridge too, otherwise, it will cause timeout.
    global.webDriverBridge && global.webDriverBridge.close();

    // eslint-disable-next-line no-empty
  } catch (err) {}

  global.__operation__ && console.log(`Last operation was ${global.__operation__}`);

  const { webDriver } = global;

  if (webDriver) {
    try {
      await dumpLogs(webDriver);

      // eslint-disable-next-line no-empty
    } catch (err) {}

    try {
      // Exceptions thrown in setup() will still trigger afterEach(), such as timeout.
      await webDriver.quit();

      // eslint-disable-next-line no-empty
    } catch (err) {}
  }
});

global.runHTML = async function runHTML(url, options = DEFAULT_OPTIONS) {
  options = { ...DEFAULT_OPTIONS, ...options };

  // We are assigning it to "global.webDriver" to allow Environment.teardown to terminate it if needed.
  const webDriver = (global.webDriver = await allocateWebDriver(options));

  try {
    const absoluteURL = new URL(url, 'https://webchat2/__tests__/html2/');

    if (STORE_MODE) {
      absoluteURL.hash = new URLSearchParams({ 'webchat-test-store-mode': STORE_MODE }).toString();

      // Also as a cookie, kept when a page redirects to a URL with another fragment. A cookie needs a page of the site.
      global.__operation__ = 'setting the store mode cookie';

      await webDriver.get(new URL('/assets/index.css', absoluteURL).toString());
      await webDriver.manage().addCookie({ name: 'webchat-test-store-mode', path: '/', value: STORE_MODE });
    }

    global.__operation__ = `loading URL ${absoluteURL.toString()}`;

    await webDriver.get(absoluteURL);

    global.__operation__ = 'setting class name for body element';

    /* istanbul ignore next */
    await webDriver.executeScript(() => {
      // This code will ship to browser VM where "document" is available.
      // eslint-disable-next-line no-undef
      document.body.className = 'jest';
    });

    const proxies = createProxies(webDriver);

    global.webDriverBridge = registerProxies(webDriver, proxies);

    global.__operation__ = 'waiting for the bridge to ready';

    // Wait until the page is loaded. This will generate a better errors.
    await expect(proxies.host.readyPromise).resolves.toBeUndefined();

    global.__operation__ = 'running test code';

    // Wait until test call done() or errored out.
    await proxies.host.donePromise;

    global.__operation__ = 'retrieving code coverage';

    const postCoverage = await webDriver.executeScript(
      () =>
        // This code will ship to browser VM where "window" is available.
        // eslint-disable-next-line no-undef
        window.__coverage__
    );

    // Merge code coverage result.
    global.__coverage__ = mergeCoverageMap(global.__coverage__, postCoverage);
    global.__operation__ = undefined;
  } catch (err) {
    try {
      const filename = join(tmpdir(), basename(global.jasmine.testPath, '.js') + '.png');

      // We use `tmpdir()` and `basename()` and make sure it don't write outside of /tmp/.
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      writeFile(filename, Buffer.from(await webDriver.takeScreenshot(), 'base64'));

      err.message += `\nSee screenshot for details: ${filename}\n`;

      // eslint-disable-next-line no-empty
    } catch (err) {}

    throw err;
  } finally {
    // After the done.promise is resolved or rejected, before terminating the Web Driver session, we need to wait a bit longer for the RPC callback to complete.
    // Otherwise, the RPC return call will throw "NoSuchSessionError" because the session was killed.

    // eslint-disable-next-line no-magic-numbers
    await sleep(100);
  }
};
