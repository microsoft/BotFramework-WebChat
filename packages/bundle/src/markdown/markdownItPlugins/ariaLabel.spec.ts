import MarkdownIt from 'markdown-it';

import ariaLabel, { pre, post } from './ariaLabel';

test('should render {aria-label="Bing search"}', () => {
  const markdown = 'Visit [Bing](https://bing.com/){aria-label="Bing search"} to start.';

  const html = post(new MarkdownIt().use(ariaLabel).render(pre(markdown)));

  expect(html).toBe('<p>Visit <a href="https://bing.com/" aria-label="Bing search">Bing</a> to start.</p>\n');
});

test('should render {1} as-is', () => {
  const markdown = 'This is number {1}.';

  const html = post(new MarkdownIt().use(ariaLabel).render(pre(markdown)));

  expect(html).toBe('<p>This is number {1}.</p>\n');
});

test('should render {title="abc"} as-is', () => {
  const markdown = 'Visit [Bing](https://bing.com/){title="abc"} to start.';

  const html = post(new MarkdownIt().use(ariaLabel).render(pre(markdown)));

  expect(html).toBe('<p>Visit <a href="https://bing.com/">Bing</a>{title=&quot;abc&quot;} to start.</p>\n');
});
