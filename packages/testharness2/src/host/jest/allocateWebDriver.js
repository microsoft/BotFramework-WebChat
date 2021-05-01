const { Builder, logging } = require('selenium-webdriver');
const { Options: ChromeOptions } = require('selenium-webdriver/chrome');

// const findHostIP = require('../dev/utils/findHostIP');

// TODO: We can modify the allocation logic here to reuse existing tabs.
//       But we will need a out-of-process server to handle the reuse, because Jest is going to teardown the environment.
//       Create new session = 1.3-2.0s, open URL = 1.0-1.5s.
module.exports = async function allocateWebDriver({ webDriverURL }) {
  global.__operation__ = 'allocating Web Driver session';

  const preferences = new logging.Preferences();

  preferences.setLevel(logging.Type.BROWSER, logging.Level.ALL);

  // const hostIP = await findHostIP();

  const webDriver = (global.webDriver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(
      new ChromeOptions().headless().setLoggingPrefs(preferences).windowSize({ height: 640, width: 360 })
    )
    // .usingWebDriverProxy(`http://${hostIP}:8888`)
    .usingServer(webDriverURL)
    .build());

  return webDriver;
};
