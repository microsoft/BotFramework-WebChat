import MarkdownIt from 'markdown-it';

import addTargetBlankToHyperlinksMarkdown from './addTargetBlankToHyperlinksMarkdown';

test('add to external links', () => {
  const markdownIt = new MarkdownIt();
  const markdown = 'Hello, [Microsoft](https://microsoft.com/)!';
  const tree = markdownIt.parseInline(markdown);
  const updatedTree = addTargetBlankToHyperlinksMarkdown(tree);
  const html = markdownIt.renderer.render(updatedTree);

  expect(html).toMatchInlineSnapshot(
    `"Hello, <a href=\\"https://microsoft.com/\\" rel=\\"noopener noreferrer\\" target=\\"_blank\\">Microsoft</a>!"`
  );
});

test("don't add for hashes", () => {
  const markdownIt = new MarkdownIt();
  const markdown = 'Hello, [Microsoft](#microsoft)!';
  const tree = markdownIt.parseInline(markdown);
  const updatedTree = addTargetBlankToHyperlinksMarkdown(tree);
  const html = markdownIt.renderer.render(updatedTree);

  expect(html).toMatchInlineSnapshot(`"Hello, <a href=\\"#microsoft\\">Microsoft</a>!"`);
});

test("don't add for searches", () => {
  const markdownIt = new MarkdownIt();
  const markdown = 'Hello, [Microsoft](?q=microsoft)!';
  const tree = markdownIt.parseInline(markdown);
  const updatedTree = addTargetBlankToHyperlinksMarkdown(tree);
  const html = markdownIt.renderer.render(updatedTree);

  expect(html).toMatchInlineSnapshot(`"Hello, <a href=\\"?q=microsoft\\">Microsoft</a>!"`);
});

test("don't add for cross references", () => {
  const markdownIt = new MarkdownIt();
  const markdown = 'Hello, [Microsoft]!';
  const tree = markdownIt.parseInline(markdown, { references: { MICROSOFT: { href: '#microsoft' } } });
  const updatedTree = addTargetBlankToHyperlinksMarkdown(tree);
  const html = markdownIt.renderer.render(updatedTree);

  expect(html).toMatchInlineSnapshot(`"Hello, <a href=\\"#microsoft\\">Microsoft</a>!"`);
});
