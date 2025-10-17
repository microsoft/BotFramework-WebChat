const { Builder, logging } = require('selenium-webdriver');
const { Options: ChromeOptions } = require('selenium-webdriver/chrome');

module.exports = async function allocateWebDriver({ webDriverURL }) {
  global.__operation__ = 'allocating Web Driver session';

  const preferences = new logging.Preferences();

  preferences.setLevel(logging.Type.BROWSER, logging.Level.ALL);

  const builder = new Builder().forBrowser('chrome').setChromeOptions(
    new ChromeOptions()
      // TODO: [P1] --headless is not quite working.
      //            Headless is supposed to be chrome-less (no window border).
      //            After we set webDriver.manage().window().size(1024, 768), webDriver.takeScreenshot() is not returning a 1024x768 image.
      .addArguments('--headless') // WebDriver deprecated .headless(), more info at https://github.com/SeleniumHQ/selenium/commit/5a97adf9864a346fdd8914cdb1b601c05dd837ac
      .addArguments('--window-size=1920,1080')
      // .addArguments('--single-process') // --single-process works on 124 but fail silently on >= 133.
      .setAcceptInsecureCerts(true) // We are accessing https://webchat2/ which has a self-signed certificate.
      .setLoggingPrefs(preferences)
  );

  const webDriver = (global.webDriver = await builder.usingServer(webDriverURL).build());

  return webDriver;
};
