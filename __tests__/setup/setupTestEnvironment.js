import { join, posix, relative } from 'path';
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
          ),
        fileDetector: {
          handleFile: (_, path) => {
            // It seems file detector does not work in local Chrome.
            // Thus, we are prepending local path first (for local Chrome), and removing it here (for Docker Chrome).
            const localPath = join(__dirname, 'local');
            const relativePath = relative(localPath, path);

            return posix.join('/~/Downloads', relativePath);
          }
        }
      };
  }
}
