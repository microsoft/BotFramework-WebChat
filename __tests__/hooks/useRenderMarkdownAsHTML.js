import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('renderMarkdown should use Markdown-It if not set in props', async () => {
  const { pageObjects } = await setupWebDriver();

  await expect(pageObjects.runHook('useRenderMarkdownAsHTML', [], fn => fn('Hello, World!'))).resolves.toBe(
    '<p>Hello, World!</p>\n'
  );
});

test('renderMarkdown should use custom Markdown transform function from props', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      renderMarkdown: text => text.toUpperCase()
    }
  });

  await expect(
    pageObjects.runHook('useRenderMarkdownAsHTML', [], fn => fn('Hello, World!'))
  ).resolves.toMatchInlineSnapshot(`"HELLO, WORLD!"`);
});

test('renderMarkdown should return falsy if the custom Markdown transform function is null', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      renderMarkdown: null
    }
  });

  await expect(pageObjects.runHook('useRenderMarkdownAsHTML', [], fn => !!fn)).resolves.toMatchInlineSnapshot(`false`);
});
