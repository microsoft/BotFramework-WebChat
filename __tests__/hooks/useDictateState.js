import { timeouts } from '../constants.json';

import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should return dictate state', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      webSpeechPonyfillFactory: () => window.WebSpeechMock
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  expect((await pageObjects.runHook('useDictateState'))[0]).toMatchInlineSnapshot(`0`);

  await pageObjects.clickMicrophoneButton();

  // Dictate state "1" is for "automatic turning on microphone after current synthesis completed".
  expect((await pageObjects.runHook('useDictateState'))[0]).toMatchInlineSnapshot(`2`);

  await pageObjects.putSpeechRecognitionResult('recognizing', 'Hello');

  expect((await pageObjects.runHook('useDictateState'))[0]).toMatchInlineSnapshot(`3`);

  await pageObjects.clickMicrophoneButton();

  expect((await pageObjects.runHook('useDictateState'))[0]).toMatchInlineSnapshot(`4`);
});

test('setter should throw exception', async () => {
  const { pageObjects } = await setupWebDriver();

  await expect(pageObjects.runHook('useDictateState', [], dictateState => dictateState[1]())).rejects.toThrow();
});
