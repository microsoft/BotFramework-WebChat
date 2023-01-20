// TODO: [P4] Object.fromEntries is not on Node.js 11.*
//       If all devs are on Node.js >= 12.0, we can remove "core-js"
import fromEntries from 'core-js/features/object/from-entries';

import updateMarkdownAttrs from './updateMarkdownAttrs';

Object.fromEntries = fromEntries;

test('add "rel" and "target" attributes', () => {
  const token = {
    attrs: [['href', 'https://example.org/']]
  };

  const actual = updateMarkdownAttrs(token, attrs => ({ ...attrs, rel: 'noopener noreferrer', target: '_blank' }));

  expect(actual).toMatchInlineSnapshot(`
    Object {
      "attrs": Array [
        Array [
          "href",
          "https://example.org/",
        ],
        Array [
          "rel",
          "noopener noreferrer",
        ],
        Array [
          "target",
          "_blank",
        ],
      ],
    }
  `);

  // The token passed in should kept unchanged
  expect(token).toMatchInlineSnapshot(`
    Object {
      "attrs": Array [
        Array [
          "href",
          "https://example.org/",
        ],
      ],
    }
  `);
});

test('replace "href" attribute', () => {
  const token = {
    attrs: [['href', 'https://example.org/']]
  };

  const actual = updateMarkdownAttrs(token, () => ({ href: 'https://microsoft.com/' }));

  expect(actual).toMatchInlineSnapshot(`
    Object {
      "attrs": Array [
        Array [
          "href",
          "https://microsoft.com/",
        ],
      ],
    }
  `);

  // The token passed in should kept unchanged
  expect(token).toMatchInlineSnapshot(`
    Object {
      "attrs": Array [
        Array [
          "href",
          "https://example.org/",
        ],
      ],
    }
  `);
});
