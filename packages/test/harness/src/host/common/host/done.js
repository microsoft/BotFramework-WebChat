const { logging } = require('selenium-webdriver');
const checkAccessibility = require('./checkAccessibility');
const getBrowserLogs = require('../getBrowserLogs');

function isDeprecation(message) {
  // Match "deprecate" or "deprecation".
  return message.includes('deprecat');
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
            ) ||
            message.includes('ReactDOM.render is no longer supported in React 18. Use createRoot instead.') ||
            // TODO: [P0] We should fix the "Cannot update a component while rendering a different component" error.
            (message.includes('Cannot update a component') && message.includes('while rendering a different component'))
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

    resolve();
  };
