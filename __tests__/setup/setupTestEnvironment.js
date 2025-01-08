import { logging } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';

export default function setupTestEnvironment(browserName, builder, { height = 640, width = 360, zoom = 1 } = {}) {
  const preferences = new logging.Preferences();

  preferences.setLevel(logging.Type.BROWSER, logging.Level.WARNING);

  let chromeOptions;

  switch (browserName) {
    case 'chrome-local':
      chromeOptions = (builder.getChromeOptions() || new Options()).windowSize({
        height: height * zoom,
        width: width * zoom
      });

      chromeOptions.setLoggingPrefs(preferences);

      return {
        baseURL: 'http://localhost:$PORT/index.html',
        builder: builder.forBrowser('chrome').setChromeOptions(chromeOptions)
      };

    case 'chrome-docker':
    default: {
      chromeOptions = (builder.getChromeOptions() || new Options())
        .addArguments('--headless') // More info at https://github.com/SeleniumHQ/selenium/commit/5a97adf9864a346fdd8914cdb1b601c05dd837ac
        .windowSize({ height: height * zoom, width: width * zoom });

      chromeOptions.setLoggingPrefs(preferences);

      return {
        baseURL: 'http://webchat/',
        builder: builder
          .forBrowser('chrome')
          .usingServer('http://localhost:4444/wd/hub')
          .setChromeOptions(chromeOptions)
      };
    }
  }
}
