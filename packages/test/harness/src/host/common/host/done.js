const { logging } = require('selenium-webdriver');
const checkAccessibility = require('./checkAccessibility');
const getBrowserLogs = require('../getBrowserLogs');

function isDeprecation(message) {
  // Match "deprecate" or "deprecation".
  return message.includes('deprecat');
}

// "redux" or "webchat", for every page of the run (see runHTML.js).
const TEST_ENGINE = process.env.WEBCHAT_TEST_ENGINE;

// With the "webchat" engine, every store that the helpers of the page-object created must be the engine: a page that
// lost the engine of the run would test Redux instead. Pages that render without a store stay on Redux.
async function checkTestEngine(webDriver) {
  // This code will ship to browser VM where "window" is available.
  // eslint-disable-next-line no-undef
  const stores = await webDriver.executeScript(() => window.__webChatTestStores__ || []);

  if (stores.includes('redux')) {
    throw new Error(
      `WebChatTest: With the "webchat" engine, the helpers must not create a Redux store, stores created: ${stores.join(', ')}.`
    );
  }
}

module.exports = (webDriver, resolve) =>
  async function done({ expectDeprecations = false, ignoreErrors = false, skipCheckAccessibility = false } = {}) {
    skipCheckAccessibility || (await checkAccessibility(webDriver)());

    const entries = await getBrowserLogs(webDriver);

    if (expectDeprecations) {
      expect(entries.some(({ message }) => isDeprecation(message))).toBeTruthy();
    }

    // Check if there are any console.error.
    if (!ignoreErrors && logging) {
      const errors = entries.filter(({ level }) => level === logging.Level.SEVERE);
      const filteredErrors = errors.filter(
        ({ message }) =>
          !(
            message.includes(
              'Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.'
            ) || message.includes('ReactDOM.render is no longer supported in React 18. Use createRoot instead.')
          )
      );

      expect(filteredErrors).toHaveLength(0);
    }

    // All `toMatchImageSnapshot()` will pass so we can generate multiple diffs on a single run.
    // But always fail in `done()` when one of the snapshot test failed.
    // See /packages/test/harness/src/host/common/host/snapshot.js
    if ('__snapshotfail__' in webDriver) {
      throw new Error(webDriver.__snapshotfail__ || 'At least one of the snapshot test failed');
    }

    TEST_ENGINE === 'webchat' && (await checkTestEngine(webDriver));

    resolve();
  };
