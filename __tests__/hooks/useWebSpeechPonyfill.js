import { timeouts } from '../constants.json';
import executePromiseScript from '../setup/pageObjects/executePromiseScript.js';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should return webSpeechPonyfill from props', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      webSpeechPonyfillFactory: () => window.WebSpeechMock
    }
  });

  await expect(
    pageObjects.runHook('useWebSpeechPonyfill', [], webSpeechPonyfill => !!webSpeechPonyfill[0])
  ).resolves.toBeTruthy();
});

test('getter should return undefined if not set in props', async () => {
  const { pageObjects } = await setupWebDriver();

  // Although useWebSpeechPonyfill return [undefined], runHook/executeAsyncScript turned it into [null].
  await expect(
    pageObjects.runHook('useWebSpeechPonyfill', [], webSpeechPonyfill => webSpeechPonyfill[0])
  ).resolves.toBeNull();
});

test('setter should throw exception', async () => {
  const { pageObjects } = await setupWebDriver();

  await expect(
    pageObjects.runHook('useWebSpeechPonyfill', [], webSpeechPonyfill => webSpeechPonyfill[1]())
  ).rejects.toThrow();
});
