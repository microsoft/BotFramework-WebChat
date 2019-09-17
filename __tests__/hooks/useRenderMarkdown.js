import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('renderMarkdown should use Markdown-It if not set in props', async () => {
  const { pageObjects } = await setupWebDriver();

  await expect(pageObjects.runHook('useRenderMarkdown', [], fn => fn('Hello, World!'))).resolves.toBe(
    '<p>Hello, World!</p>\n'
  );
});

test.todo('renderMarkdown should return transform function set in props');
