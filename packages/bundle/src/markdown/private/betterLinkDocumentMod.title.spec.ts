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

describe('When passing "title" option with "Hello, World!"', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { title: 'Hello, World!' };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFragmentFromString(baseHTML), () => decoration);
  });

  test('should have "title" attribute set to "Hello, World!"', () =>
    expect(actual.querySelector('a').getAttribute('title')).toBe('Hello, World!'));

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml"><a href="https://example.com" title="Hello, World!">Example</a></p>'
    ));
});

describe('When passing "title" option with false', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { title: false };

  beforeEach(() => {
    actual = betterLinkDocumentMod(
      parseDocumentFragmentFromString('<a href="https://example.com" title="Hello, World!">Example</a>'),
      () => decoration
    );
  });

  test('should have "title" attribute removed', () =>
    expect(actual.querySelector('a').hasAttribute('title')).toBe(false));

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<a xmlns="http://www.w3.org/1999/xhtml" href="https://example.com">Example</a>'
    ));
});
