import MarkdownIt from 'markdown-it';

import betterLink from './betterLink';

test('should render "externalLinkAlt"', () => {
  const html = new MarkdownIt()
    .use(betterLink, () => ({ externalLinkAlt: 'open in new window' }))
    .render('This is a [link](https://bing.com/).');

  expect(html).toBe('<p>This is a <a href="https://bing.com/" title="open in new window">link</a>.</p>\n');
});

test('should render "iconClassName"', () => {
  const html = new MarkdownIt()
    .use(betterLink, () => ({ iconClassName: 'icon' }))
    .render('This is a [link](https://bing.com/).');

  expect(html).toBe(
    '<p>This is a <a href="https://bing.com/">link<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" class="icon"></a>.</p>\n'
  );
});

test('should render "iconClassName" with "externalLinkAlt"', () => {
  const html = new MarkdownIt()
    .use(betterLink, () => ({ externalLinkAlt: 'open in new window', iconClassName: 'icon' }))
    .render('This is a [link](https://bing.com/).');

  expect(html).toBe(
    '<p>This is a <a href="https://bing.com/" title="open in new window">link<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="open in new window" class="icon"></a>.</p>\n'
  );
});

test('should render "linkClassName"', () => {
  const html = new MarkdownIt()
    .use(betterLink, () => ({ linkClassName: 'link' }))
    .render('This is a [link](https://bing.com/).');

  expect(html).toBe('<p>This is a <a href="https://bing.com/" class="link">link</a>.</p>\n');
});

test('should render "rel"', () => {
  const html = new MarkdownIt()
    .use(betterLink, () => ({ rel: 'noopener noreferrer' }))
    .render('This is a [link](https://bing.com/).');

  expect(html).toBe('<p>This is a <a href="https://bing.com/" rel="noopener noreferrer">link</a>.</p>\n');
});

test('should render "target"', () => {
  const html = new MarkdownIt()
    .use(betterLink, () => ({ target: '_blank' }))
    .render('This is a [link](https://bing.com/).');

  expect(html).toBe('<p>This is a <a href="https://bing.com/" target="_blank">link</a>.</p>\n');
});
