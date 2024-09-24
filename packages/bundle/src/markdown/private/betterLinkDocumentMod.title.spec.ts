/** @jest-environment jsdom */

import { parseDocumentFromString, serializeDocumentIntoString } from 'botframework-webchat-component/internal';
import MarkdownIt from 'markdown-it';
import betterLink from '../markdownItPlugins/betterLink';
import betterLinkDocumentMod, { type BetterLinkDocumentModDecoration } from './betterLinkDocumentMod';

const BASE_MARKDOWN = '[Example](https://example.com)';
const BASE_HTML = new MarkdownIt().render(BASE_MARKDOWN);

describe('When passing "title" option with "Hello, World!"', () => {
  let actual: Document;
  const decoration: BetterLinkDocumentModDecoration = { title: 'Hello, World!' };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFromString(BASE_HTML), () => decoration);
  });

  test('should have "title" attribute set to "Hello, World!"', () =>
    expect(actual.querySelector('a').getAttribute('title')).toBe('Hello, World!'));

  test('should match snapshot', () =>
    expect(serializeDocumentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml"><a href="https://example.com" title="Hello, World!">Example</a></p>\n'
    ));

  test('should match baseline', () =>
    expect(serializeDocumentIntoString(actual)).toBe(
      serializeDocumentIntoString(
        parseDocumentFromString(new MarkdownIt().use(betterLink, () => decoration).render(BASE_MARKDOWN))
      )
    ));
});

describe('When passing "title" option with false', () => {
  let actual: Document;
  const decoration: BetterLinkDocumentModDecoration = { title: false };

  beforeEach(() => {
    actual = betterLinkDocumentMod(
      parseDocumentFromString('<a href="https://example.com" title="Hello, World!">Example</a>'),
      () => decoration
    );
  });

  test('should have "title" attribute removed', () =>
    expect(actual.querySelector('a').hasAttribute('title')).toBe(false));

  test('should match snapshot', () =>
    expect(serializeDocumentIntoString(actual)).toBe(
      '<a xmlns="http://www.w3.org/1999/xhtml" href="https://example.com">Example</a>\n'
    ));
});
