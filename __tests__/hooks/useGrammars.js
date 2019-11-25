import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should return grammars set in props', async () => {
  const { pageObjects } = await setupWebDriver({ props: { grammars: ['Tuen Mun', 'Yuen Long'] } });

  const [grammars] = await pageObjects.runHook('useGrammars');

  expect(grammars).toMatchInlineSnapshot(`
    Array [
      "Tuen Mun",
      "Yuen Long",
    ]
  `);
});

test('getter should return empty array if not set in props', async () => {
  const { pageObjects } = await setupWebDriver();

  const [grammars] = await pageObjects.runHook('useGrammars');

  expect(grammars).toEqual([]);
});

test('setter should throw exception', async () => {
  const { pageObjects } = await setupWebDriver();

  await expect(pageObjects.runHook('useGrammars', [], grammars => grammars[1]())).rejects.toThrow();
});
