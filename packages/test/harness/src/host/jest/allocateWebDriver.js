const { Builder, logging } = require('selenium-webdriver');
const { Options: ChromeOptions } = require('selenium-webdriver/chrome');

module.exports = async function allocateWebDriver({ webDriverURL }) {
  global.__operation__ = 'allocating Web Driver session';

  const preferences = new logging.Preferences();

  preferences.setLevel(logging.Type.BROWSER, logging.Level.ALL);

  const builder = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new ChromeOptions().addArguments('--single-process').headless().setLoggingPrefs(preferences));

  const webDriver = (global.webDriver = await builder.usingServer(webDriverURL).build());

  return webDriver;
};
