import { imageSnapshotOptions, timeouts } from '../constants.json';

import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('calling performCardAction should send card action to middleware', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      cardActionMiddleware: ({ dispatch }) => next => ({ cardAction }) => {
        if (cardAction.type === 'openUrl') {
          dispatch({
            type: 'WEB_CHAT/SEND_MESSAGE',
            payload: {
              text: `Navigating to ${cardAction.value}`
            }
          });
        } else {
          return next(cardAction);
        }
      }
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.runHook('usePerformCardAction', [], performCardAction =>
    performCardAction({ type: 'openUrl', value: 'about:blank' })
  );

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
