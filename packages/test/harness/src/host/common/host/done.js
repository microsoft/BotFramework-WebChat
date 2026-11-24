const { logging } = require('selenium-webdriver');
const checkAccessibility = require('./checkAccessibility');
const getBrowserLogs = require('../getBrowserLogs');

function isDeprecation(message) {
  // Match "deprecate" or "deprecation".
  return message.includes('deprecat');
}

// "redux" or "webchat", for every page of the run (see runHTML.js).
const TEST_ENGINE = process.env.WEBCHAT_TEST_ENGINE;

// With the "webchat" engine, a test passes only if the page ran on it, and `<Composer>` without a `store` created no
// Redux store.
async function checkTestEngine(webDriver) {
  const { counts, engine } = await webDriver.executeScript(() => {
    // This code will ship to browser VM where "document", "location" and "window" are available.
    /* eslint-disable no-undef */
    const cookie = document.cookie.split('; ').find(entry => entry.startsWith('webchat-test-engine='));
    const internal = window.__WEBCHAT_TEST_INTERNAL__ || (window.WebChat && window.WebChat.internal);
    const getStoreCounts = internal && internal.__INTERNAL_DO_NOT_USE__getStoreCounts;

    return {
      counts: typeof getStoreCounts === 'function' ? getStoreCounts() : null,
      // As `testHelpers.getTestEngine()` of the page-object.
      engine:
        new URLSearchParams(location.hash.replace(/^#/u, '')).get('webchat-test-engine') ||
        (cookie ? decodeURIComponent(cookie.split('=')[1]) : 'redux')
    };
    /* eslint-enable no-undef */
  });

  if (engine !== (TEST_ENGINE || 'redux')) {
    throw new Error(`WebChatTest: The run uses the "${TEST_ENGINE || 'redux'}" engine, but the page used "${engine}".`);
  }

  if (engine === 'webchat' && counts && counts.redux) {
    throw new Error(
      `WebChatTest: With the "webchat" engine, <Composer> without a store must not create a Redux store, store counts: ${JSON.stringify(counts)}.`
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

    await checkTestEngine(webDriver);

    resolve();
  };
