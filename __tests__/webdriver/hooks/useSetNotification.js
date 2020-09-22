import { timeouts } from '../__jest__/constants.json';

import toastShown from '../__jest__/conditions/toastShown';
import uiConnected from '../__jest__/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('calling setNotification should set and update notification', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.runHook('useSetNotification', [], setNotification =>
    setNotification({
      id: 'privacypolicy',
      level: 'info',
      message: 'Please read our [privacy policy](https://microsoft.com/privacypolicy).'
    })
  );

  await driver.wait(toastShown(1), timeouts.ui);
  await driver.wait(toastShown('Please read our privacy policy.'), timeouts.ui);

  await pageObjects.runHook('useSetNotification', [], setNotification =>
    setNotification({
      id: 'privacypolicy',
      level: 'info',
      message: 'Please read our [privacy policy](https://microsoft.com/privacypolicy) again.'
    })
  );

  await driver.wait(toastShown(1), timeouts.ui);
  await driver.wait(toastShown('Please read our privacy policy again.'), timeouts.ui);
});
