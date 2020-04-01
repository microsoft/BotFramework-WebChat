import { By, until } from 'selenium-webdriver';

import { imageSnapshotOptions, timeouts } from './constants.json';

import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import scrollToBottomCompleted from './setup/conditions/scrollToBottomCompleted';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

// jest.setTimeout(timeouts.test);
jest.setTimeout(15000);

describe('hero card actions', () => {
  let driver;

  async function clickHeroCardButton(nthChild) {
    await driver.wait(
      () =>
        driver.executeScript(nthChild => {
          const button = document.querySelector('.ac-actionSet button:nth-of-type(' + nthChild + ')');

          button && button.click();

          return button;
        }, nthChild),
      timeouts.ui
    );
  }

  beforeEach(async () => {
    const setup = await setupWebDriver({ useProductionBot: true });

    driver = setup.driver;

    await driver.wait(uiConnected(), timeouts.directLine);

    await setup.pageObjects.sendMessageViaSendBox('herocardactions');
    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  });

  test('imBack', async () => {
    await clickHeroCardButton(1);

    await driver.wait(minNumActivitiesShown(4), timeouts.directLine);
    await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);
    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('postBack (string)', async () => {
    await clickHeroCardButton(2);

    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);
    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('postBack (JSON)', async () => {
    await clickHeroCardButton(3);

    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);
    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('messageBack (displayText + text + value)', async () => {
    await clickHeroCardButton(4);

    await driver.wait(minNumActivitiesShown(4), timeouts.directLine);
    await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);
    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('messageBack (displayText + text)', async () => {
    await clickHeroCardButton(5);

    await driver.wait(minNumActivitiesShown(4), timeouts.directLine);
    await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);
    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('messageBack (value)', async () => {
    await clickHeroCardButton(6);

    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);
    await driver.wait(scrollToBottomCompleted(), timeouts.scrollToBottom);
    expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });
});
