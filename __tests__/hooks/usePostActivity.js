import { timeouts } from '../constants.json';

import minNumActivitiesShown from '../setup/conditions/minNumActivitiesShown';
import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('calling postActivity should send an activity', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.runHook('usePostActivity', [], fn =>
    fn({
      text: 'Hello, World!',
      type: 'message'
    })
  );

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
        "textFormat": undefined,
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
