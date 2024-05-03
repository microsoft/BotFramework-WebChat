/** @jest-environment jsdom */

import { parseDocumentFromString, serializeDocumentIntoString } from 'botframework-webchat-component/internal';
import MarkdownIt from 'markdown-it';
import betterLink from '../markdownItPlugins/betterLink';
import betterLinkDocumentMod, { type BetterLinkDocumentModDecoration } from './betterLinkDocumentMod';

const BASE_MARKDOWN = '[Example](https://example.com)';
const BASE_HTML = new MarkdownIt().render(BASE_MARKDOWN);

describe('When passing "wrapZeroWidthSpace" option with true', () => {
  let actual: Document;
  const decoration: BetterLinkDocumentModDecoration = { wrapZeroWidthSpace: true };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFromString(BASE_HTML), () => decoration);
  });

  test('should match snapshot', () =>
    expect(serializeDocumentIntoString(actual)).toBe(
      '<body xmlns="http://www.w3.org/1999/xhtml"><p>\u200b<a href="https://example.com">Example</a>\u200b</p>\n</body>'
    ));

  test('should match baseline', () =>
    expect(serializeDocumentIntoString(actual)).toBe(
      serializeDocumentIntoString(
        parseDocumentFromString(new MarkdownIt().use(betterLink, () => decoration).render(BASE_MARKDOWN))
      )
    ));
});

describe('When passing "wrapZeroWidthSpace" option with true and "asButton" option with true', () => {
  let actual: Document;
  const decoration: BetterLinkDocumentModDecoration = { asButton: true, wrapZeroWidthSpace: true };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFromString(BASE_HTML), () => decoration);
  });

  test('should match snapshot', () =>
    expect(serializeDocumentIntoString(actual)).toBe(
      '<body xmlns="http://www.w3.org/1999/xhtml"><p>\u200b<button type="button" value="https://example.com">Example</button>\u200b</p>\n</body>'
    ));

  test('should match baseline', () =>
    expect(serializeDocumentIntoString(actual)).toBe(
      serializeDocumentIntoString(
        parseDocumentFromString(new MarkdownIt().use(betterLink, () => decoration).render(BASE_MARKDOWN))
      )
    ));
});
