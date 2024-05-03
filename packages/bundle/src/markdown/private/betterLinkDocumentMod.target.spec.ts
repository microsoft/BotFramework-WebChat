/** @jest-environment jsdom */

import { parseDocumentFromString, serializeDocumentIntoString } from 'botframework-webchat-component/internal';
import MarkdownIt from 'markdown-it';
import betterLink from '../markdownItPlugins/betterLink';
import betterLinkDocumentMod, { type BetterLinkDocumentModDecoration } from './betterLinkDocumentMod';

const BASE_MARKDOWN = '[Example](https://example.com)';
const BASE_HTML = new MarkdownIt().render(BASE_MARKDOWN);

describe('When passing "target" option with "noopener noreferer"', () => {
  let actual: Document;
  const decoration: BetterLinkDocumentModDecoration = { target: 'noopener noreferer' };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFromString(BASE_HTML), () => decoration);
  });

  test('should have "target" attribute set to "noopener noreferer"', () =>
    expect(actual.querySelector('a').getAttribute('target')).toBe('noopener noreferer'));

  test('should match snapshot', () =>
    expect(serializeDocumentIntoString(actual)).toBe(
      '<body xmlns="http://www.w3.org/1999/xhtml"><p><a href="https://example.com" target="noopener noreferer">Example</a></p>\n</body>'
    ));

  test('should match baseline', () =>
    expect(serializeDocumentIntoString(actual)).toBe(
      serializeDocumentIntoString(
        parseDocumentFromString(new MarkdownIt().use(betterLink, () => decoration).render(BASE_MARKDOWN))
      )
    ));
});

describe('When passing "target" option with false', () => {
  let actual: Document;
  const decoration: BetterLinkDocumentModDecoration = { target: false };

  beforeEach(() => {
    actual = betterLinkDocumentMod(
      parseDocumentFromString('<a href="https://example.com" target="noopener noreferer">Example</a>'),
      () => decoration
    );
  });

  test('should have "target" attribute removed', () =>
    expect(actual.querySelector('a').hasAttribute('target')).toBe(false));

  test('should match snapshot', () =>
    expect(serializeDocumentIntoString(actual)).toBe(
      '<body xmlns="http://www.w3.org/1999/xhtml"><a href="https://example.com">Example</a></body>'
    ));
});
