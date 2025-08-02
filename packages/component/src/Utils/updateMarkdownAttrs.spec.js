import updateMarkdownAttrs from './updateMarkdownAttrs';

test('add "rel" and "target" attributes', () => {
  const token = {
    attrs: [['href', 'https://example.org/']]
  };

  const actual = updateMarkdownAttrs(token, attrs => ({ ...attrs, rel: 'noopener noreferrer', target: '_blank' }));

  expect(actual).toMatchInlineSnapshot(`
    {
      "attrs": [
        [
          "href",
          "https://example.org/",
        ],
        [
          "rel",
          "noopener noreferrer",
        ],
        [
          "target",
          "_blank",
        ],
      ],
    }
  `);

  // The token passed in should kept unchanged
  expect(token).toMatchInlineSnapshot(`
    {
      "attrs": [
        [
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
    {
      "attrs": [
        [
          "href",
          "https://microsoft.com/",
        ],
      ],
    }
  `);

  // The token passed in should kept unchanged
  expect(token).toMatchInlineSnapshot(`
    {
      "attrs": [
        [
          "href",
          "https://example.org/",
        ],
      ],
    }
  `);
});
