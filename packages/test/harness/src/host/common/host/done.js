const { logging } = require('selenium-webdriver');
const checkAccessibility = require('./checkAccessibility');
const getBrowserLogs = require('../getBrowserLogs');

// "redux" or "default", for every page of the run (see runHTML.js).
const STORE_MODE = process.env.WEBCHAT_TEST_STORE_MODE;

function isDeprecation(message) {
  // Match "deprecate" or "deprecation".
  return message.includes('deprecat');
}

// In default mode, a test passes only if Web Chat really ran without Redux: no mount of the Redux providers, at least one
// of the default providers. A page that lost the mode, or Web Chat without the mount counts, fails.
async function checkStoreMode(webDriver) {
  const { counts, mode } = await webDriver.executeScript(() => {
    // This code will ship to browser VM where "document", "location" and "window" are available.
    /* eslint-disable no-undef */
    const cookie = document.cookie.split('; ').find(entry => entry.startsWith('webchat-test-store-mode='));
    const internal = window.__WEBCHAT_TEST_INTERNAL__ || (window.WebChat && window.WebChat.internal);
    const getProviderMountCounts = internal && internal.__INTERNAL_DO_NOT_USE__getProviderMountCounts;

    return {
      counts: typeof getProviderMountCounts === 'function' ? getProviderMountCounts() : null,
      mode:
        (document.querySelector('meta[name="webchat-test-store-mode"]') || { getAttribute: () => null }).getAttribute(
          'content'
        ) ||
        new URLSearchParams(location.hash.replace(/^#/u, '')).get('webchat-test-store-mode') ||
        (cookie && decodeURIComponent(cookie.split('=')[1])) ||
        'redux'
    };
    /* eslint-enable no-undef */
  });

  if (STORE_MODE === 'default' && mode !== 'default') {
    throw new Error(`WebChatTest: The run is in default mode, but the page ran in "${mode}" mode.`);
  }

  if (mode === 'default' && !(counts && counts.redux === 0 && counts.default > 0)) {
    throw new Error(
      `WebChatTest: In default mode, Web Chat must mount the default providers and never the Redux providers, mount counts: ${JSON.stringify(counts)}.`
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

    await checkStoreMode(webDriver);

    resolve();
  };
