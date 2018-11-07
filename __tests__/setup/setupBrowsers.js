import { Options } from 'selenium-webdriver/chrome';

export default function (browserName, builder) {
  switch (browserName) {
    case 'chrome-headless-mobile':
      return builder.forBrowser('chrome').setChromeOptions(
        (builder.getChromeOptions() || new Options())
          .headless()
          .setMobileEmulation({
            height: 640,
            pixelRatio: 3,
            width: 360
          })
      );

    case 'chrome-headless-pc':
      return builder.forBrowser('chrome').setChromeOptions(
        (builder.getChromeOptions() || new Options())
          .headless()
          .windowSize({ height: 640, width: 360 })
      );

    case 'chrome-docker':
      return builder.forBrowser('chrome').usingServer('http://localhost:4444/wd/hub').setChromeOptions(
        (builder.getChromeOptions() || new Options())
          .windowSize({ height: 640, width: 360 })
      );

    case 'chrome-local':
    default:
      return builder.forBrowser('chrome').setChromeOptions(
        (builder.getChromeOptions() || new Options())
          .windowSize({ height: 640, width: 360 })
      );
  }
};
