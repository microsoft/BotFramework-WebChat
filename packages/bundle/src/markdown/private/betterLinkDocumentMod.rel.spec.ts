/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import {
  parseDocumentFragmentFromString,
  serializeDocumentFragmentIntoString
} from 'botframework-webchat-component/internal';
import { micromark } from 'micromark';
import betterLinkDocumentMod, { type BetterLinkDocumentModDecoration } from './betterLinkDocumentMod';

const BASE_MARKDOWN = '[Example](https://example.com)';
let baseHTML: string;

beforeEach(() => {
  baseHTML = micromark(BASE_MARKDOWN, { allowDangerousHtml: true });
});

describe('When passing "rel" option with "noopener noreferer"', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { rel: 'noopener noreferer' };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFragmentFromString(baseHTML), () => decoration);
  });

  test('should have "rel" attribute set to "noopener noreferer"', () =>
    expect(actual.querySelector('a').getAttribute('rel')).toBe('noopener noreferer'));

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml"><a href="https://example.com" rel="noopener noreferer">Example</a></p>'
    ));
});

describe('When passing "rel" option with false', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { rel: false };

  beforeEach(() => {
    actual = betterLinkDocumentMod(
      parseDocumentFragmentFromString('<a href="https://example.com" rel="noopener noreferer">Example</a>'),
      () => decoration
    );
  });

  test('should have "rel" attribute removed', () => expect(actual.querySelector('a').hasAttribute('rel')).toBe(false));

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<a xmlns="http://www.w3.org/1999/xhtml" href="https://example.com">Example</a>'
    ));
});
