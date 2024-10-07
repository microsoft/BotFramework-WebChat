/** @jest-environment jsdom */

import {
  parseDocumentFragmentFromString,
  serializeDocumentFragmentIntoString
} from 'botframework-webchat-component/internal';
import MarkdownIt from 'markdown-it';
import betterLink from '../markdownItPlugins/betterLink';
import betterLinkDocumentMod, { type BetterLinkDocumentModDecoration } from './betterLinkDocumentMod';

const BASE_MARKDOWN = '[Example](https://example.com)';
const BASE_HTML = new MarkdownIt().render(BASE_MARKDOWN);

describe('When passing "className" option with "my-link"', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { className: 'my-link' };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFragmentFromString(BASE_HTML), () => decoration);
  });

  test('should have "className" attribute set to "my-link"', () =>
    expect(actual.querySelector('a').classList.contains('my-link')).toBe(true));

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml"><a href="https://example.com" class="my-link">Example</a></p>\n'
    ));

  test('should match baseline', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      serializeDocumentFragmentIntoString(
        parseDocumentFragmentFromString(new MarkdownIt().use(betterLink, () => decoration).render(BASE_MARKDOWN))
      )
    ));
});

describe('When passing "className" option with false', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { className: false };

  beforeEach(() => {
    actual = betterLinkDocumentMod(
      parseDocumentFragmentFromString('<a href="https://example.com" class="my-link">Example</a>'),
      () => decoration
    );
  });

  test('should have "class" attribute removed', () =>
    expect(actual.querySelector('a').hasAttribute('class')).toBe(false));

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<a xmlns="http://www.w3.org/1999/xhtml" href="https://example.com">Example</a>\n'
    ));
});
