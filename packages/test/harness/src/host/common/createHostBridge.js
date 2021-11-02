const { EventTarget, Event } = require('event-target-shim');
const AbortController = require('abort-controller');

const sleep = require('../../common/utils/sleep');

class HostBridgePort {
  constructor(driver, signal) {
    this.driver = driver;
    this.signal = signal;
  }

  postMessage(data) {
    if (this.signal.aborted) {
      return;
    }

    /* istanbul ignore next */
    this.driver.executeScript(data => {
      const event = new Event('message');

      event.data = data;
      event.origin = 'wd://';

      // This code is running in browser VM where "window" is available.
      // eslint-disable-next-line no-undef
      window.dispatchEvent(event);
    }, data);
  }
}

/**
 * This is a bridge to talk to the JavaScript VM in the browser, via Web Driver executeScript().
 * The object pattern is based on W3C MessageChannel and MessagePort standard.
 */
class HostBridge extends EventTarget {
  constructor(driver) {
    super();

    this.abortController = new AbortController();
    this.browser = new HostBridgePort(driver, this.abortController.signal);
    this.start(driver);
  }

  close() {
    this.abortController.abort();
  }

  async start(driver) {
    try {
      /* eslint-disable no-await-in-loop */
      for (; !this.abortController.signal.aborted; ) {
        /* istanbul ignore next */
        const result = await driver.executeScript(
          () =>
            // This code is running in browser VM where "window" is available.
            // eslint-disable-next-line no-undef
            window.webDriverPort && window.webDriverPort.__queue.shift()
        );

        if (this.abortController.signal.aborted) {
          break;
        }

        if (!result) {
          // eslint-disable-next-line no-magic-numbers
          await sleep(100);
        } else {
          const event = new Event('message');

          event.data = result.data;
          event.origin = result.origin;

          this.dispatchEvent(event);
        }
      }
      /* eslint-enable no-await-in-loop */
    } catch (err) {
      if (err.name !== 'NoSuchSessionError' && err.name !== 'NoSuchWindowError' && err.name !== 'WebDriverError') {
        throw err;
      }
    }
  }
}

module.exports = function createHostBridge(driver) {
  return new HostBridge(driver);
};
