import { imageSnapshotOptions, timeouts } from './constants.json';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import negationOf from './setup/conditions/negationOf';
import typingAnimationBackgroundImage from './setup/assets/typingIndicator';
import typingIndicatorShown from './setup/conditions/typingIndicatorShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('changing typing indicator duration on-the-fly', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: { typingAnimationBackgroundImage, typingAnimationDuration: 1000 }
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendMessageViaSendBox('typing 1', { waitForSend: true });
  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(typingIndicatorShown(), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await driver.wait(negationOf(typingIndicatorShown()), 2000);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);

  await pageObjects.updateProps({
    styleOptions: { typingAnimationBackgroundImage, typingAnimationDuration: 5000 }
  });

  await driver.wait(typingIndicatorShown(), timeouts.ui);

  expect(await driver.takeScreenshot()).toMatchImageSnapshot(imageSnapshotOptions);
});
