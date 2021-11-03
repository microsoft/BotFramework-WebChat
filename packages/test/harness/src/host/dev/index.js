// This will run an instance of Chrome via Web Driver locally.
// It will be headed (vs. headless) and is used for development purpose only.

const { Builder, logging } = require('selenium-webdriver');
const { Options: ChromeOptions, ServiceBuilder: ChromeServiceBuilder } = require('selenium-webdriver/chrome');
const AbortController = require('abort-controller');
const expect = require('expect');
const fetch = require('node-fetch');

const createDevProxies = require('./createDevProxies');
const findHostIP = require('./utils/findHostIP');
const findLocalIP = require('./utils/findLocalIP');
const registerProxies = require('../common/registerProxies');
const setAsyncInterval = require('./utils/setAsyncInterval');
const sleep = require('../../common/utils/sleep');

const ONE_DAY = 86400000;

global.expect = expect;

async function main() {
  const abortController = new AbortController();
  const hostIP = await findHostIP();
  const localIP = await findLocalIP();

  const service = await new ChromeServiceBuilder('./chromedriver.exe')
    .addArguments('--allowed-ips', localIP)
    .setHostname(hostIP)
    .setStdio(['ignore', 'ignore', 'ignore'])
    .build();

  // eslint-disable-next-line no-magic-numbers
  const webDriverURL = await service.start(10000);

  try {
    const preferences = new logging.Preferences();

    preferences.setLevel(logging.Type.BROWSER, logging.Level.ALL);

    const webDriver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(new ChromeOptions().setLoggingPrefs(preferences))
      .usingServer(webDriverURL)
      .build();

    const sessionId = (await webDriver.getSession()).getId();

    const terminate = async () => {
      abortController.abort();
      // WebDriver.quit() will kill all async functions for executeScript().
      // HTTP DELETE will kill the session.
      // Combining two will forcefully kill the Web Driver session immediately.

      try {
        webDriver.quit(); // Don't await or Promise.all on quit().

        await fetch(new URL(sessionId, webDriverURL), { method: 'DELETE', timeout: 2000 });

        // eslint-disable-next-line no-empty
      } catch (err) {}
    };

    process.once('SIGINT', terminate);
    process.once('SIGTERM', terminate);

    try {
      await webDriver.sendDevToolsCommand('Emulation.setTimezoneOverride', { timezoneId: 'Etc/UTC' });
      // eslint-disable-next-line no-magic-numbers
      await webDriver.get(process.argv[2] || 'http://localhost:5080/');

      registerProxies(webDriver, createDevProxies(webDriver));

      setAsyncInterval(
        async () => {
          try {
            await webDriver.getWindowHandle();
          } catch (err) {
            abortController.abort();
          }
        },
        // eslint-disable-next-line no-magic-numbers
        2000,
        abortController.signal
      );

      await sleep(ONE_DAY, abortController.signal);
    } finally {
      await terminate();
    }
  } finally {
    await service.kill();
  }
}

main().catch(err => {
  err.message === 'aborted' || console.error(err);

  throw err;
});
