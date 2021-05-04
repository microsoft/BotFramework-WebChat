const { logging } = require('selenium-webdriver');

const IGNORE_CONSOLE_MESSAGE_FRAGMENTS = [
  '[TESTHARNESS]',
  'favicon.ico',
  'in-browser Babel transformer',
  'react-devtools'
];

module.exports = async function getBrowserLogs(webDriver, { clear = false } = {}) {
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
