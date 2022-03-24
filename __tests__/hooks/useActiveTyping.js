import { Key } from 'selenium-webdriver';

import { timeouts } from '../constants.json';

import minNumActivitiesShown from '../setup/conditions/minNumActivitiesShown';
import uiConnected from '../setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should represent bot and user typing respectively', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: { sendTypingIndicator: true },
    setup: () =>
      Promise.all([
        window.WebChatTest.loadScript('https://unpkg.com/core-js@2.6.3/client/core.min.js'),
        window.WebChatTest.loadScript('https://unpkg.com/lolex@4.0.1/lolex.js')
      ]).then(() => {
        window.WebChatTest.clock = lolex.install();
      })
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  let activeTyping;

  await expect(pageObjects.runHook('useActiveTyping')).resolves.toEqual([{}]);

  await pageObjects.typeInSendBox('typing 1');

  activeTyping = await pageObjects.runHook('useActiveTyping');

  expect(Object.values(activeTyping[0])).toEqual([
    {
      at: 0,
      expireAt: 5000,
      name: 'Happy Web Chat user',
      role: 'user'
    }
  ]);

  await pageObjects.typeInSendBox(Key.ENTER);
  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

  activeTyping = await pageObjects.runHook('useActiveTyping');

  expect(Object.values(activeTyping[0])).toEqual([
    {
      at: 0,
      expireAt: 5000,
      name: 'Bot',
      role: 'bot'
    }
  ]);

  await pageObjects.typeInSendBox('.');

  activeTyping = await pageObjects.runHook('useActiveTyping');

  expect(Object.values(activeTyping[0]).sort(({ role: x }, { role: y }) => x - y)).toEqual([
    {
      at: 0,
      expireAt: 5000,
      name: 'Bot',
      role: 'bot'
    },
    {
      at: 0,
      expireAt: 5000,
      name: 'Happy Web Chat user',
      role: 'user'
    }
  ]);
});

test('getter should filter out inactive typing', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: { sendTypingIndicator: true },
    setup: () =>
      Promise.all([
        window.WebChatTest.loadScript('https://unpkg.com/core-js@2.6.3/client/core.min.js'),
        window.WebChatTest.loadScript('https://unpkg.com/lolex@4.0.1/lolex.js')
      ]).then(() => {
        window.WebChatTest.clock = lolex.install();
      })
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  let activeTyping;

  await expect(pageObjects.runHook('useActiveTyping')).resolves.toEqual([{}]);

  await pageObjects.typeInSendBox('Hello, World!');

  activeTyping = await pageObjects.runHook('useActiveTyping');

  expect(Object.values(activeTyping[0])).toEqual([
    {
      at: 0,
      expireAt: 5000,
      name: 'Happy Web Chat user',
      role: 'user'
    }
  ]);

  // We need to wait for 6000 ms because:
  // 1. t=0: Typed letter "H"
  // 2. t=0: Send typing activity
  // 3. t=10: Typed letter "a"
  // 4. t=10: Scheduled another typing indicator at t=3000
  // 5. t=3000: Send typing activity
  await driver.executeScript(() => window.WebChatTest.clock.tick(3000));

  activeTyping = await pageObjects.runHook('useActiveTyping');

  expect(Object.values(activeTyping[0])).toEqual([
    {
      at: 3000,
      expireAt: 8000,
      name: 'Happy Web Chat user',
      role: 'user'
    }
  ]);

  await driver.executeScript(() => window.WebChatTest.clock.tick(8000));

  await expect(pageObjects.runHook('useActiveTyping')).resolves.toEqual([{}]);

  // Even it is filtered out, when setting a longer expiration, it should come back.
  activeTyping = await pageObjects.runHook('useActiveTyping', [10000]);

  expect(Object.values(activeTyping[0])).toEqual([
    {
      at: 3000,
      expireAt: 13000,
      name: 'Happy Web Chat user',
      role: 'user'
    }
  ]);
});

test('setter should be falsy', async () => {
  const { pageObjects } = await setupWebDriver();
  const [_, setActiveTyping] = await pageObjects.runHook('useActiveTyping');

  expect(setActiveTyping).toBeFalsy();
});
