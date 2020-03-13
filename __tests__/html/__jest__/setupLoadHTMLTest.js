const { Builder } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');
const { URL } = require('url');
const fetch = require('node-fetch');

const indent = require('./indent');
const mergeCoverageMap = require('./mergeCoverageMap');

let activeDriver;
let activeSessionId;

afterEach(async () => {
  try {
    if (activeDriver) {
      const { consoleHistory, currentConditionMessage, localCoverage } = await activeDriver.executeScript(() => ({
        consoleHistory: window.WebChatTest.getConsoleHistory(),
        currentConditionMessage: window.WebChatTest.currentCondition && window.WebChatTest.currentCondition.message,
        localCoverage: window.__coverage__
      }));

      const lines = [];

      global.__coverage__ = mergeCoverageMap(global.__coverage__, localCoverage);

      consoleHistory.forEach(({ args, level }) => {
        const message = args.join(' ');

        if (!~message.indexOf('in-browser Babel transformer')) {
          lines.push(`📃 [${level}] ${message}`);
        }
      });

      if (currentConditionMessage) {
        lines.push(`\n❗ Jest timed out while test code is waiting for "${currentConditionMessage}".\n`);
      }

      lines.length && console.log(indent([`💬 Browser`, indent(lines.join('\n'), 2)].join('\n')));

      activeDriver = null;
    }
  } finally {
    if (activeSessionId) {
      // Using JSON Wire Protocol to kill Web Driver.
      // This is more reliable because Selenium package queue commands.
      const res = await fetch(`http://localhost:4444/wd/hub/session/${activeSessionId}`, { method: 'DELETE' });

      if (!res.ok) {
        const json = await res.json();

        throw new Error(
          `Failed to kill WebDriver session ${activeSessionId}.\n\n${json && json.value && json.value.message}`
        );
      }

      activeSessionId = null;
    }
  }
});

beforeEach(async () => {
  activeDriver = null;
  activeSessionId = null;
});

global.loadHTMLTest = async (url, { height = 640, width = 360, zoom = 1 } = {}) => {
  if (activeDriver || activeSessionId) {
    throw new Error('WebChatTest: You can call "loadHTMLTest" only once for each test.');
  }

  const builder = new Builder();
  const chromeOptions = (builder.getChromeOptions() || new Options()).windowSize({
    height: height * zoom,
    width: width * zoom
  });

  if (global.docker) {
    activeDriver = builder
      .forBrowser('chrome')
      .usingServer('http://localhost:4444/wd/hub')
      .setChromeOptions(chromeOptions.headless())
      .build();
  } else {
    activeDriver = builder
      .forBrowser('chrome')
      .usingServer('http://localhost:9515/')
      .setChromeOptions(chromeOptions)
      .build();
  }

  activeSessionId = (await activeDriver.getSession()).getId();

  // For unknown reason, if we use ?wd=1, it will be removed.
  // But when we use #wd=1, it kept.
  const absoluteURL = global.docker
    ? new URL(`#wd=1`, new URL(url, 'http://webchat2/'))
    : new URL(url, `http://localhost:${global.webServerPort}/`);

  await activeDriver.get(absoluteURL);

  return { driver: activeDriver };
};
