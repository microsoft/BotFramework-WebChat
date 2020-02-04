import updateMarkdownItAttrs from './updateMarkdownItAttrs';

test('add "rel" and "target" attributes', () => {
  const token = {
    attrs: [['href', 'https://example.org/']]
  };

  const actual = updateMarkdownItAttrs(token, attrs => ({ ...attrs, rel: 'noopener noreferrer', target: '_blank' }));

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

  const actual = updateMarkdownItAttrs(token, () => ({ href: 'https://microsoft.com/' }));

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
