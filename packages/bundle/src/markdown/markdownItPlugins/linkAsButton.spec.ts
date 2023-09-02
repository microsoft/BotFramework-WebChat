import MarkdownIt from 'markdown-it';

import linkAsButton from './linkAsButton';

test('should render "externalLinkAlt"', () => {
  const html = new MarkdownIt()
    .use(linkAsButton, 'link-button', () => true)
    .render('This is a [button](https://bing.com/).');

  expect(html).toBe(
    '<p>This is a <button href="https://bing.com/" class="link-button" type="button" value="https://bing.com/">button</button>.</p>\n'
  );
});
