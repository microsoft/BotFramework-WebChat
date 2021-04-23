import { Browser, Builder, logging } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import { URL } from 'url';
import fetch from 'node-fetch';

import { timeout } from './sleep';
import indent from './indent';
import mergeCoverageMap from './mergeCoverageMap';
import parseURLParams from './parseURLParams';
import runPageProcessor from './runPageProcessor';

global.runHTMLTest = async (
  url,
  { height = 640, ignoreConsoleError = false, ignorePageError = false, width = 360, zoom = 1 } = {}
) => {
  const builder = new Builder();
  const chromeOptions = (builder.getChromeOptions() || new Options()).windowSize({
    height: height * zoom,
    width: width * zoom
  });

  const preferences = new logging.Preferences();

  // preferences.setLevel(logging.Type.BROWSER, logging.Level.WARNING);
  preferences.setLevel(logging.Type.BROWSER, logging.Level.ALL);
  chromeOptions.setLoggingPrefs(preferences);

  const driver = global.docker
    ? builder
        .forBrowser('chrome')
        .usingServer('http://localhost:4444/wd/hub')
        .setChromeOptions(chromeOptions.headless())
        .build()
    : builder.forBrowser('chrome').usingServer('http://localhost:9515').setChromeOptions(chromeOptions).build();

  const session = await Promise.race([
    driver.getSession(),
    timeout(
      15000,
      'Timed out while waiting for a Web Driver session. There are probably more test runners running simultaneously than Web Driver sessions, or some Web Driver sessions are not responding.'
    )
  ]);

  const sessionId = session.getId();

  const params = parseURLParams(new URL(url, 'http://webchat2/').hash);

  try {
    // We are only parsing the "hash" from "url", the "http://localhost/" is actually ignored.
    let { hash } = new URL(url, 'http://localhost/');

    if (hash) {
      hash += '&wd=1';
    } else {
      hash = '#wd=1';
    }

    // For unknown reason, if we use ?wd=1, it will be removed.
    // But when we use #wd=1, it kept.
    await driver.get(
      global.docker
        ? new URL(hash, new URL(url, 'http://webchat2/'))
        : new URL(url, `http://localhost:${global.webServerPort}/`)
    );

    await runPageProcessor(driver, { ignoreConsoleError, ignorePageError });

    const { currentConditionMessage, localCoverage } = await driver.executeScript(() => ({
      currentConditionMessage: window.WebChatTest.currentCondition && window.WebChatTest.currentCondition.message,
      localCoverage: window.__coverage__
    }));

    global.__coverage__ = mergeCoverageMap(global.__coverage__, localCoverage);

    currentConditionMessage &&
      console.log(`❗ Jest timed out while test code is waiting for "${currentConditionMessage}".\n`);
  } finally {
    const lines = await driver.manage().logs().get('browser');
    const output = [];

    lines.forEach(({ level: { name }, message }) => {
      const match = /"(.*?)"/.exec(message.split(' ').slice(2).join(' '));
      const text = (match && match[1]) || '';

      if (
        ~text.indexOf('in-browser Babel transformer') ||
        ~text.indexOf('react-devtools') ||
        (ignoreConsoleError && name === 'ERROR')
      ) {
        return;
      }

      output.push(`📃 [${name}] ${text}`);
    });

    output.length && console.log(indent([`💬 Browser`, indent(output.join('\n'), 2)].join('\n')));

    // Using JSON Wire Protocol to kill Web Driver.
    // This is more reliable because Selenium package queue commands.
    const res = await fetch(`${builder.getServerUrl()}/session/${sessionId}`, { method: 'DELETE' });

    if (!res.ok) {
      const json = await res.json();

      console.warn(`Failed to kill WebDriver session ${sessionId}.\n\n${json && json.value && json.value.message}`);
    }
  }
};
