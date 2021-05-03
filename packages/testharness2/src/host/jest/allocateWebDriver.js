const { Builder, logging } = require('selenium-webdriver');
const { Options: ChromeOptions } = require('selenium-webdriver/chrome');

const findHostIP = require('../dev/utils/findHostIP');
const portAlive = require('../common/portAlive');

// TODO: We can modify the allocation logic here to reuse existing tabs.
//       But we will need a out-of-process server to handle the reuse, because Jest is going to teardown the environment.
//       Create new session = 1.3-2.0s, open URL = 1.0-1.5s.
module.exports = async function allocateWebDriver({ webDriverURL }) {
  global.__operation__ = 'allocating Web Driver session';

  const preferences = new logging.Preferences();

  preferences.setLevel(logging.Type.BROWSER, logging.Level.ALL);

  const hostIP = await findHostIP();

  const builder = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new ChromeOptions().addArguments('--single-process').headless().setLoggingPrefs(preferences));

  // If Fiddler is opened on port 8888, connect to it.
  if (await portAlive(hostIP, 8888)) {
    builder.usingWebDriverProxy(`http://${hostIP}:8888`);
  }

  const webDriver = (global.webDriver = await builder.usingServer(webDriverURL).build());

  return webDriver;
};
