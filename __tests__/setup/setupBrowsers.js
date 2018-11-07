import { Options } from 'selenium-webdriver/chrome';

export default function (browserName, builder) {
  switch (browserName) {
    case 'chrome-headless-mobile':
      return builder.setChromeOptions(
        (builder.getChromeOptions() || new Options())
          .headless()
          .setMobileEmulation({
            height: 640,
            pixelRatio: 3,
            width: 360
          })
      );

    case 'chrome-headless-pc':
      return builder.setChromeOptions(
        (builder.getChromeOptions() || new Options())
          .headless()
          .windowSize({ height: 640, width: 360 })
      );

    case 'chrome-local':
    default:
      return builder.setChromeOptions(
        (builder.getChromeOptions() || new Options())
          .windowSize({ height: 640, width: 360 })
      );
  }
};
