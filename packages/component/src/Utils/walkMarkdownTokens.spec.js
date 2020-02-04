import MarkdownIt from 'markdown-it';
import updateIn from 'simple-update-in';

import walkMarkdownTokens from './walkMarkdownTokens';

test('add class="markdown" to every node', () => {
  const markdownIt = new MarkdownIt();
  const tree = markdownIt.parse('Hello, [World](#world)!');
  const patchedTree = walkMarkdownTokens(tree, token => {
    return updateIn(token, ['attrs'], attrs => [...(attrs || []), ['class', 'markdown']]);
  });
  const actual = markdownIt.renderer.render(patchedTree);

  expect(actual).toMatchInlineSnapshot(`
    "<p class=\\"markdown\\">Hello, <a href=\\"#world\\" class=\\"markdown\\">World</a class=\\"markdown\\">!</p class=\\"markdown\\">
    "
  `);
});
