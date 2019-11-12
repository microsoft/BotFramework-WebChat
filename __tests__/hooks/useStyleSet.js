import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should get styleSet from props', async () => {
  const { pageObjects } = await setupWebDriver({
    props: { styleSet: { options: {}, root: { backgroundColor: 'Red' } } }
  });

  await expect(pageObjects.runHook('useStyleSet', [], result => result[0])).resolves.toMatchInlineSnapshot(`
          Object {
            "options": Object {},
            "root": Object {
              "data-css-1mjk9yt": "",
            },
          }
        `);
});

test('setter should be falsy', async () => {
  const { pageObjects } = await setupWebDriver();
  const [_, setStyleSet] = await pageObjects.runHook('useStyleSet');

  expect(setStyleSet).toBeFalsy();
});
