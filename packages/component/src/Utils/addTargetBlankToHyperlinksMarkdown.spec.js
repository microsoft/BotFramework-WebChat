// TODO: [P4] Object.fromEntries is not on Node.js 11.*
//       If all devs are on Node.js >= 12.0, we can remove "core-js"
import fromEntries from 'core-js/features/object/from-entries';
import MarkdownIt from 'markdown-it';

import addTargetBlankToHyperlinksMarkdown from './addTargetBlankToHyperlinksMarkdown';

Object.fromEntries = fromEntries;

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
