import MarkdownIt from 'markdown-it';

import betterLink from './betterLink';

// ariaLabel?: false | string;
// asButton?: boolean;
// iconAlt?: string;
// iconClassName?: string;
// className?: false | string;
// rel?: false | string;
// target?: false | string;
// title?: false | string;

test('should render "ariaLabel"', () => {
  const html = new MarkdownIt()
    .use(betterLink, () => ({ ariaLabel: 'Hello, World!' }))
    .render('This is a [link](https://bing.com/).');

  expect(html).toBe('<p>This is a <a href="https://bing.com/" aria-label="Hello, World!">link</a>.</p>\n');
});

test('should render "asButton"', () => {
  const html = new MarkdownIt()
    .use(betterLink, () => ({ asButton: true }))
    .render('This is a [link](https://bing.com/).');

  expect(html).toBe('<p>This is a <button type="button" value="https://bing.com/">link</button>.</p>\n');
});

test('should render "className"', () => {
  const html = new MarkdownIt()
    .use(betterLink, () => ({ className: 'link' }))
    .render('This is a [link](https://bing.com/).');

  expect(html).toBe('<p>This is a <a href="https://bing.com/" class="link">link</a>.</p>\n');
});

test('should render "iconClassName"', () => {
  const html = new MarkdownIt()
    .use(betterLink, () => ({ iconClassName: 'icon' }))
    .render('This is a [link](https://bing.com/).');

  expect(html).toBe(
    '<p>This is a <a href="https://bing.com/">link<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" class="icon"></a>.</p>\n'
  );
});

test('should render "iconClassName" with "iconAlt"', () => {
  const html = new MarkdownIt()
    .use(betterLink, () => ({ iconAlt: 'open in new window', iconClassName: 'icon' }))
    .render('This is a [link](https://bing.com/).');

  expect(html).toBe(
    '<p>This is a <a href="https://bing.com/">link<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" class="icon" title="open in new window"></a>.</p>\n'
  );
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

test('should render "title"', () => {
  const html = new MarkdownIt()
    .use(betterLink, () => ({ title: 'Hello, World!' }))
    .render('This is a [link](https://bing.com/).');

  expect(html).toBe('<p>This is a <a href="https://bing.com/" title="Hello, World!">link</a>.</p>\n');
});
