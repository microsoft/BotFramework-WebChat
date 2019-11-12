import { timeouts } from '../constants.json';

import minNumActivitiesShown from '../setup/conditions/minNumActivitiesShown';
import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('should return list of activities', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('Hello, World!', { waitForSend: true });

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

  const [activities] = await pageObjects.runHook('useActivities');
  const cleanedActivities = activities
    .filter(({ type }) => type === 'message')
    .map(({ from: { role }, speak, text, textFormat, type }) => ({ from: { role }, speak, text, textFormat, type }));

  expect(cleanedActivities).toMatchInlineSnapshot(`
    Array [
      Object {
        "from": Object {
          "role": "user",
        },
        "speak": undefined,
        "text": "Hello, World!",
        "textFormat": "plain",
        "type": "message",
      },
      Object {
        "from": Object {
          "role": "bot",
        },
        "speak": "Unknown command: I don't know Hello, World!. You can say \\"help\\" to learn more.",
        "text": "Unknown command: \`Hello, World!\`.

    Type \`help\` to learn more.",
        "textFormat": undefined,
        "type": "message",
      },
    ]
  `);
});

test('setter should be falsy', async () => {
  const { pageObjects } = await setupWebDriver();
  const [_, setActivities] = await pageObjects.runHook('useActivities');

  expect(setActivities).toBeFalsy();
});
