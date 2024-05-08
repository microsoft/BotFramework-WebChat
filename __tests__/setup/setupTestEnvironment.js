import { logging } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';

export default function setupTestEnvironment(browserName, builder, { height = 640, width = 360, zoom = 1 } = {}) {
  const preferences = new logging.Preferences();

  preferences.setLevel(logging.Type.BROWSER, logging.Level.WARNING);

  switch (browserName) {
    case 'chrome-local':
      const localOptions = (builder.getChromeOptions() || new Options()).windowSize({
        height: height * zoom,
        width: width * zoom
      });

      localOptions.setLoggingPrefs(preferences);

      return {
        baseURL: 'http://localhost:$PORT/index.html',
        builder: builder.forBrowser('chrome').setChromeOptions(localOptions)
      };

    case 'chrome-docker':
    default:
      const dockerOptions = (builder.getChromeOptions() || new Options())
        .headless()
        .windowSize({ height: height * zoom, width: width * zoom });

      dockerOptions.setLoggingPrefs(preferences);

      return {
        baseURL: 'http://webchat/',
        builder: builder
          .forBrowser('chrome')
          .usingServer('http://localhost:4444/wd/hub')
          .setChromeOptions(dockerOptions)
      };
  }
}
