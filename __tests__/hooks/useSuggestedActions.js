import { timeouts } from '../constants.json';

import suggestedActionsShown from '../setup/conditions/suggestedActionsShown';
import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should get suggested actions', async () => {
  const { driver, pageObjects } = await setupWebDriver();

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendMessageViaSendBox('suggested-actions');
  await driver.wait(suggestedActionsShown(), timeouts.directLine);

  await expect(pageObjects.runHook('useSuggestedActions', [], result => result[0])).resolves.toMatchInlineSnapshot(`
          Array [
            Object {
              "image": "https://tdurnford.github.io/BotFramework-Offline-MockBot/assets/square-icon.png",
              "title": "IM back as string",
              "type": "imBack",
              "value": "postback imback-string",
            },
            Object {
              "image": "https://tdurnford.github.io/BotFramework-Offline-MockBot/assets/square-icon-red.png",
              "title": "Post back as string",
              "type": "postBack",
              "value": "postback postback-string",
            },
            Object {
              "image": "https://tdurnford.github.io/BotFramework-Offline-MockBot/assets/square-icon-green.png",
              "text": "Some text",
              "title": "Post back as JSON",
              "type": "postBack",
              "value": Object {
                "hello": "World!",
              },
            },
            Object {
              "displayText": "say Hello World!",
              "image": "https://tdurnford.github.io/BotFramework-Offline-MockBot/assets/square-icon-purple.png",
              "text": "Some text",
              "title": "Message back as JSON with display text",
              "type": "messageBack",
              "value": Object {
                "hello": "World!",
              },
            },
            Object {
              "image": "https://tdurnford.github.io/BotFramework-Offline-MockBot/assets/square-icon-purple.png",
              "title": "Message back as JSON without display text",
              "type": "messageBack",
              "value": Object {
                "hello": "World!",
              },
            },
            Object {
              "displayText": "Aloha",
              "image": "https://tdurnford.github.io/BotFramework-Offline-MockBot/assets/square-icon-purple.png",
              "text": "echo Hello",
              "title": "Message back as string with display text",
              "type": "messageBack",
              "value": null,
            },
          ]
        `);
});
