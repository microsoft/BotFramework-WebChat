const { logging } = require('selenium-webdriver');

const IGNORE_CONSOLE_MESSAGE_FRAGMENTS = [
  '[TESTHARNESS]',
  'favicon.ico',
  'in-browser Babel transformer',
  'react-devtools'
];

module.exports = async function getBrowserLogs(webDriver, { clear = false } = {}) {
  // Every call to webDriver.manage().logs().get() will clean up the log.
  // This function will persist the logs across function calls, until `clear` is set to `true`.
  const newLogs = (await webDriver.manage().logs().get(logging.Type.BROWSER)).filter(
    // Ignore console entries that contains specified fragments.
    ({ message }) =>
      !IGNORE_CONSOLE_MESSAGE_FRAGMENTS.some(ignoreFragment =>
        ignoreFragment instanceof RegExp ? ignoreFragment.test(message) : ~message.indexOf(ignoreFragment)
      )
  );

  const logs = (global.__logs = [...(global.__logs || []), ...newLogs]);

  if (clear) {
    delete global.__logs;
  }

  return logs;
};
