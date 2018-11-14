import { Options } from 'selenium-webdriver/chrome';

export default function (browserName, builder) {
  switch (browserName) {
    case 'chrome-local':
      return {
        baseURL: 'http://localhost:$PORT/index.html',
        builder: builder.forBrowser('chrome').setChromeOptions(
          (builder.getChromeOptions() || new Options())
            .windowSize({ height: 640, width: 360 })
        )
      };

    case 'chrome-docker':
    default:
      return {
        baseURL: 'http://webchat/',
        builder: builder.forBrowser('chrome').usingServer('http://localhost:4444/wd/hub').setChromeOptions(
          (builder.getChromeOptions() || new Options())
            .headless()
            .windowSize({ height: 640, width: 360 })
        )
      };
  }
};
