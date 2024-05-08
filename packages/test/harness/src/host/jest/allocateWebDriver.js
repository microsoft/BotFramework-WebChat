const { Builder, logging } = require('selenium-webdriver');
const { Options: ChromeOptions } = require('selenium-webdriver/chrome');

module.exports = async function allocateWebDriver({ webDriverURL }) {
  global.__operation__ = 'allocating Web Driver session';

  const preferences = new logging.Preferences();

  preferences.setLevel(logging.Type.BROWSER, logging.Level.ALL);

  const builder = new Builder().forBrowser('chrome').setChromeOptions(
    new ChromeOptions()
      .addArguments('--headless=chrome') // Should change to "--headless=new" for Chrome >= 109
      .addArguments('--single-process')
      .setLoggingPrefs(preferences)
  );

  const webDriver = (global.webDriver = await builder.usingServer(webDriverURL).build());

  return webDriver;
};
