import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should return group timestamp set in props', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      groupTimestamp: 1000
    }
  });

  const [groupTimestamp] = await pageObjects.runHook('useGroupTimestamp');

  expect(groupTimestamp).toMatchInlineSnapshot(`1000`);
});

test('getter should return default group timestamp if not set in props', async () => {
  const { pageObjects } = await setupWebDriver();

  const [groupTimestamp] = await pageObjects.runHook('useGroupTimestamp');

  expect(groupTimestamp).toMatchInlineSnapshot(`true`);
});

test('getter should return false if group timestamp is disabled', async () => {
  const { pageObjects } = await setupWebDriver({
    props: { groupTimestamp: false }
  });

  const [groupTimestamp] = await pageObjects.runHook('useGroupTimestamp');

  expect(groupTimestamp).toMatchInlineSnapshot(`false`);
});

test('setter should be falsy', async () => {
  const { pageObjects } = await setupWebDriver();
  const [_, setGroupTimestamp] = await pageObjects.runHook('useGroupTimestamp');

  expect(setGroupTimestamp).toBeFalsy();
});
