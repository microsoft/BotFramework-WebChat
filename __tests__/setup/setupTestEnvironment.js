import { Options } from 'selenium-webdriver/chrome';

export default function setupTestEnvironment(browserName, builder, { height = 640, width = 360, zoom = 1 } = {}) {
  switch (browserName) {
    case 'chrome-local':
      return {
        baseURL: 'http://localhost:$PORT/index.html',
        builder: builder
          .forBrowser('chrome')
          .setChromeOptions(
            (builder.getChromeOptions() || new Options()).windowSize({ height: height * zoom, width: width * zoom })
          )
      };

    case 'chrome-docker':
    default:
      return {
        baseURL: 'http://webchat/',
        builder: builder
          .forBrowser('chrome')
          .usingServer('http://localhost:4444/wd/hub')
          .setChromeOptions(
            (builder.getChromeOptions() || new Options())
              .headless()
              .windowSize({ height: height * zoom, width: width * zoom })
          )
      };
  }
}
