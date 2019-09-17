import { timeouts } from '../constants.json';

import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should get falsy if last outgoing message is not from microphone', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('Hello, World!');

  await expect(pageObjects.runHook('useShouldSpeakIncomingActivity', [], result => result[0])).resolves.toBeFalsy();
});

test('getter should get truthy if last outgoing message is from microphone', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: { webSpeechPonyfillFactory: () => window.WebSpeechMock }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaMicrophone('Hello, World!');

  await expect(pageObjects.runHook('useShouldSpeakIncomingActivity', [], result => result[0])).resolves.toBeTruthy();
});
