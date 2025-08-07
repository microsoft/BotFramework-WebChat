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

describe('When passing "className" option with "my-link"', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { className: 'my-link' };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFragmentFromString(baseHTML), () => decoration);
  });

  test('should have "className" attribute set to "my-link"', () =>
    expect(actual.querySelector('a').classList.contains('my-link')).toBe(true));

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml"><a href="https://example.com" class="my-link">Example</a></p>'
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
      '<a xmlns="http://www.w3.org/1999/xhtml" href="https://example.com">Example</a>'
    ));
});
