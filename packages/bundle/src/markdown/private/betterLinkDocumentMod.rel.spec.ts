/** @jest-environment jsdom */

import MarkdownIt from 'markdown-it';
import betterLink from '../markdownItPlugins/betterLink';
import betterLinkDocumentMod, { type BetterLinkDocumentModDecoration } from './betterLinkDocumentMod';
import parseDocumentFromString from './parseDocumentFromString';
import serializeDocumentIntoString from './serializeDocumentIntoString';

const BASE_MARKDOWN = '[Example](https://example.com)';
const BASE_HTML = new MarkdownIt().render(BASE_MARKDOWN);

describe('When passing "rel" option with "noopener noreferer"', () => {
  let actual: Document;
  const decoration: BetterLinkDocumentModDecoration = { rel: 'noopener noreferer' };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFromString(BASE_HTML), () => decoration);
  });

  test('should have "rel" attribute set to "noopener noreferer"', () =>
    expect(actual.querySelector('a').getAttribute('rel')).toBe('noopener noreferer'));

  test('should match snapshot', () =>
    expect(serializeDocumentIntoString(actual)).toBe(
      '<p><a href="https://example.com" rel="noopener noreferer">Example</a></p>\n'
    ));

  test('should match baseline', () =>
    expect(serializeDocumentIntoString(actual)).toBe(
      serializeDocumentIntoString(
        parseDocumentFromString(new MarkdownIt().use(betterLink, () => decoration).render(BASE_MARKDOWN))
      )
    ));
});

describe('When passing "rel" option with false', () => {
  let actual: Document;
  const decoration: BetterLinkDocumentModDecoration = { rel: false };

  beforeEach(() => {
    actual = betterLinkDocumentMod(
      parseDocumentFromString('<a href="https://example.com" rel="noopener noreferer">Example</a>'),
      () => decoration
    );
  });

  test('should have "rel" attribute removed', () => expect(actual.querySelector('a').hasAttribute('rel')).toBe(false));

  test('should match snapshot', () =>
    expect(serializeDocumentIntoString(actual)).toBe('<a href="https://example.com">Example</a>'));
});
