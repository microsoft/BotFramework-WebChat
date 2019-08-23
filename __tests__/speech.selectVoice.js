import { timeouts } from './constants.json';

import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import speechSynthesisUtterancePended from './setup/conditions/speechSynthesisUtterancePended';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

describe('selecting voice based on language', () => {
  describe('based on language', () => {
    test('of en-US', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          locale: 'en-US',
          webSpeechPonyfillFactory: () => window.WebSpeechMock
        }
      });

      await pageObjects.sendMessageViaMicrophone('echo 123');

      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
      await driver.wait(speechSynthesisUtterancePended(), timeouts.ui);

      await expect(pageObjects.startSpeechSynthesize()).resolves.toHaveProperty('voice', {
        default: true,
        lang: 'en-US',
        localService: true,
        name: 'Mock Voice (en-US)',
        voiceURI: 'mock://web-speech/voice/en-US'
      });
    });

    test('of zh-YUE', async () => {
      const { driver, pageObjects } = await setupWebDriver({
        props: {
          locale: 'zh-YUE',
          webSpeechPonyfillFactory: () => window.WebSpeechMock
        }
      });

      await pageObjects.sendMessageViaMicrophone('echo 123');

      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
      await driver.wait(speechSynthesisUtterancePended(), timeouts.ui);

      await expect(pageObjects.startSpeechSynthesize()).resolves.toHaveProperty('voice', {
        default: false,
        lang: 'zh-YUE',
        localService: true,
        name: 'Mock Voice (zh-YUE)',
        voiceURI: 'mock://web-speech/voice/zh-YUE'
      });
    });
  });

  test('using a custom selectVoice function', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        locale: 'en-US',
        selectVoice: voices => voices.find(({ lang }) => lang === 'zh-YUE'),
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await pageObjects.sendMessageViaMicrophone('echo 123');

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(speechSynthesisUtterancePended(), timeouts.ui);

    await expect(pageObjects.startSpeechSynthesize()).resolves.toHaveProperty('voice', {
      default: false,
      lang: 'zh-YUE',
      localService: true,
      name: 'Mock Voice (zh-YUE)',
      voiceURI: 'mock://web-speech/voice/zh-YUE'
    });
  });
});
