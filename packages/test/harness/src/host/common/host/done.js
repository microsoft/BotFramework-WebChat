const { logging } = require('selenium-webdriver');
const getBrowserLogs = require('../getBrowserLogs');

function isDeprecation(message) {
  // Match "deprecate" or "deprecation".
  return message.includes('deprecat');
}

module.exports = (webDriver, resolve) =>
  async function done({ expectDeprecations = false, ignoreErrors = false } = {}) {
    const entries = await getBrowserLogs(webDriver);

    if (expectDeprecations) {
      expect(entries.some(({ message }) => isDeprecation(message))).toBeTruthy();
    }

    // Check if there are any console.error.
    if (!ignoreErrors && logging) {
      expect(entries.filter(({ level }) => level === logging.Level.SEVERE)).toHaveLength(0);
    }

    resolve();
  };
