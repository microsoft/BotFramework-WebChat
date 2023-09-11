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

test('renderMarkdown should add accessibility text for external links', async () => {
  const { pageObjects } = await setupWebDriver();

  await expect(
    pageObjects.runHook('useRenderMarkdownAsHTML', [], fn => fn('Click [here](https://aka.ms/) to find out more.'))
  ).resolves.toMatchInlineSnapshot(`
          "<p>Click <a href=\\"https://aka.ms/\\" aria-label=\\"here Opens in a new window; external.\\" rel=\\"noopener noreferrer\\" target=\\"_blank\\">here<img src=\\"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\\" alt class=\\"webchat__render-markdown__external-link-icon\\" title=\\"Opens in a new window; external.\\" /></a> to find out more.</p>
          "
        `);
});

test('renderMarkdown should add accessibility text for external links with yue', async () => {
  const { pageObjects } = await setupWebDriver({ props: { locale: 'yue' } });

  await expect(
    pageObjects.runHook('useRenderMarkdownAsHTML', [], fn => fn('Click [here](https://aka.ms/) to find out more.'))
  ).resolves.toMatchInlineSnapshot(`
          "<p>Click <a href=\\"https://aka.ms/\\" aria-label=\\"here 喺新嘅視窗開啟外部連結。\\" rel=\\"noopener noreferrer\\" target=\\"_blank\\">here<img src=\\"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\\" alt class=\\"webchat__render-markdown__external-link-icon\\" title=\\"喺新嘅視窗開啟外部連結。\\" /></a> to find out more.</p>
          "
        `);
});
