const { Builder } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');
const AbortController = require('abort-controller');
const fetch = require('node-fetch');
const NodeEnvironment = require('jest-environment-node');
const { URL } = require('url');

const hostServe = require('./hostServe');
const serveJSON = require('../serve.json');

const DOCKER = true;

class WebChatEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);

    this.abortController = new AbortController();
  }

  async setup() {
    super.setup();

    const { signal } = this.abortController;

    this.global.abortSignal = signal;

    const { port } = await hostServe(signal, {
      ...serveJSON,
      public: '.'
    });

    this.global.loadPage = async (url, { height = 640, width = 360, zoom = 1 } = {}) => {
      const builder = new Builder();
      const chromeOptions = (builder.getChromeOptions() || new Options()).windowSize({
        height: height * zoom,
        width: width * zoom
      });
      let driver;

      if (DOCKER) {
        driver = builder
          .forBrowser('chrome')
          .usingServer('http://localhost:4444/wd/hub')
          .setChromeOptions(chromeOptions.headless())
          .build();
      } else {
        driver = builder
          .forBrowser('chrome')
          .usingServer('http://localhost:9515/')
          .setChromeOptions(chromeOptions)
          .build();
      }

      this.currentSessionId = (await driver.getSession()).getId();
      this.currentDriver = driver;

      if (DOCKER) {
        // For unknown reason, if we use ?wd=1, it will be removed.
        // But when we use #wd=1, it kept.
        await driver.get(new URL(`#wd=1`, new URL(url, 'http://webchat2/')));
      } else {
        await driver.get(new URL(url, `http://localhost:${port}/`).href);
      }

      return { driver };
    };
  }

  async teardown() {
    this.abortController.abort();

    if (this.currentDriver) {
      const consoleHistory = await this.currentDriver.executeScript(() => window.WebChatTest.getConsoleHistory());

      consoleHistory.forEach(({ args, level }) => {
        const message = args.join(' ');

        if (!~message.indexOf('in-browser Babel transformer')) {
          console.log(`[${level}] ${message}`);
        }
      });
    }

    if (this.currentSessionId) {
      // Using JSON Wire Protocol to kill Web Driver.
      // This is more reliable because Selenium package queue commands.
      const res = await fetch(`http://localhost:4444/wd/hub/session/${this.currentSessionId}`, { method: 'DELETE' });

      if (!res.ok) {
        const json = await res.json();

        throw new Error(
          `Failed to kill WebDriver session ${this.currentSessionId}.\n\n${json && json.value && json.value.message}`
        );
      }
    }

    this.currentSessionId = null;

    await super.teardown();
  }
}

module.exports = WebChatEnvironment;
