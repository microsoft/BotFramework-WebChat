import { By } from 'selenium-webdriver';

import { timeouts } from './constants.json';

import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

async function getContainerElement(driver) {
  return await driver.findElement(By.css('#webchat > div > div[ role ]'));
}

describe('accessibility ~ containerRole', () => {
  test('containerRole: region ~ Is allowed!', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        styleOptions: {
          containerRole: 'region'
        }
      }
    });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('echo This will set a custom containerRole.', {
      waitForSend: true
    });

    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);

    const containerElem = await getContainerElement(driver);
    const roleName = await containerElem.getAttribute('role');

    expect(roleName).toEqual('region');
    // expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('containerRole: complementary ~ Is allowed!', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      props: {
        styleOptions: {}
      }
    });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('echo This will rely on the default containerRole.', {
      waitForSend: true
    });

    await driver.wait(minNumActivitiesShown(3), timeouts.directLine);

    const containerElem = await getContainerElement(driver);
    const roleName = await containerElem.getAttribute('role');

    expect(roleName).toEqual('complementary');
  });
});
