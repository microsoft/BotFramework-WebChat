import { imageSnapshotOptions, timeouts } from '../constants.json';

import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should return dictate interims', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      webSpeechPonyfillFactory: () => window.WebSpeechMock
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.clickMicrophoneButton();
  await pageObjects.putSpeechRecognitionResult('recognizing', 'Hello');

  const [dictateInterims] = await pageObjects.runHook('useDictateInterims');

  expect(dictateInterims).toEqual(['Hello']);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});

test('setter should throw exception', async () => {
  const { pageObjects } = await setupWebDriver();

  await expect(
    pageObjects.runHook('useDictateInterims', [], dictateInterims => dictateInterims[1]())
  ).rejects.toThrow();
});
