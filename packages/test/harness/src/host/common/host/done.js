const { logging } = require('selenium-webdriver');
const getBrowserLogs = require('../getBrowserLogs');

function isDeprecation(message) {
  return message.includes('deprecate');
}

module.exports = (webDriver, resolve) => {
  return async function done({ expectDeprecations = false, ignoreErrors = false } = {}) {
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
};
