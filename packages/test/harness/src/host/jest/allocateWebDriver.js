const { Builder, logging } = require('selenium-webdriver');
const { Options: ChromeOptions } = require('selenium-webdriver/chrome');

module.exports = async function allocateWebDriver({ webDriverURL }) {
  global.__operation__ = 'allocating Web Driver session';

  const preferences = new logging.Preferences();

  preferences.setLevel(logging.Type.BROWSER, logging.Level.ALL);

  const builder = new Builder().forBrowser('chrome').setChromeOptions(
    new ChromeOptions()
      .addArguments('--headless') // More info at https://github.com/SeleniumHQ/selenium/commit/5a97adf9864a346fdd8914cdb1b601c05dd837ac
      .addArguments('--single-process')
      .setAcceptInsecureCerts(true) // We are accessing https://webchat2/ which has a self-signed certificate.
      .setLoggingPrefs(preferences)
  );

  const webDriver = (global.webDriver = await builder.usingServer(webDriverURL).build());

  return webDriver;
};
