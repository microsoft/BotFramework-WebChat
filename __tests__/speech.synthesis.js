import { timeouts } from './constants.json';

import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

describe('speech synthesis', () => {
  // Verification of fix of #1736
  test('should synthesize two consecutive messages', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await pageObjects.sendMessageViaMicrophone('echo 123');

    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(pageObjects.hasPendingSpeechSynthesisUtterance(), timeouts.ui);

    await expect(pageObjects.startSpeechSynthesize()).resolves.toHaveProperty(
      'text',
      'Echoing back in a separate activity.'
    );

    await pageObjects.endSpeechSynthesize();

    await expect(pageObjects.startSpeechSynthesize()).resolves.toHaveProperty('text', '123');

    await pageObjects.endSpeechSynthesize();
  });

  // Verification of fix of #2096
  test('should synthesize speak property of Adaptive Card', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        webSpeechPonyfillFactory: () => window.WebSpeechMock
      }
    });

    await pageObjects.sendMessageViaMicrophone('card bingsports');

    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await driver.wait(pageObjects.hasPendingSpeechSynthesisUtterance(), timeouts.ui);

    await expect(pageObjects.startSpeechSynthesize()).resolves.toHaveProperty(
      'text',
      'Showing  bingsports\r\nThe Seattle Seahawks beat the Carolina Panthers 40-7'
    );

    await pageObjects.endSpeechSynthesize();
  });
});
