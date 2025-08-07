/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import {
  parseDocumentFragmentFromString,
  serializeDocumentFragmentIntoString
} from 'botframework-webchat-component/internal';
import { micromark } from 'micromark';
import betterLinkDocumentMod, { type BetterLinkDocumentModDecoration } from './betterLinkDocumentMod';

const BASE_MARKDOWN = '[Hello, World!](https://example.com/1)\n\n[Aloha!](https://example.com/2)';
let baseHTML: string;

beforeEach(() => {
  baseHTML = micromark(BASE_MARKDOWN, { allowDangerousHtml: true });
});

describe('When passing "ariaLabel" option with "Hello, World!" for a specific anchor based on "href"', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { ariaLabel: 'Hello, World!' };

  beforeEach(() => {
    actual = betterLinkDocumentMod(
      parseDocumentFragmentFromString(baseHTML),
      href => href === 'https://example.com/1' && decoration
    );
  });

  test('should have "aria-label" attribute set to "Hello, World!"', () =>
    expect(actual.querySelector('a').getAttribute('aria-label')).toBe('Hello, World!'));

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml"><a href="https://example.com/1" aria-label="Hello, World!">Hello, World!</a></p>\n<p xmlns="http://www.w3.org/1999/xhtml"><a href="https://example.com/2">Aloha!</a></p>'
    ));
});

describe('When passing "ariaLabel" option with "Hello, World!" for a specific anchor based on "textContent"', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { ariaLabel: 'Hello, World!' };

  beforeEach(() => {
    actual = betterLinkDocumentMod(
      parseDocumentFragmentFromString(baseHTML),
      (_, textContent) => textContent === 'Hello, World!' && decoration
    );
  });

  test('should have "aria-label" attribute set to "Hello, World!"', () =>
    expect(actual.querySelector('a').getAttribute('aria-label')).toBe('Hello, World!'));

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml"><a href="https://example.com/1" aria-label="Hello, World!">Hello, World!</a></p>\n<p xmlns="http://www.w3.org/1999/xhtml"><a href="https://example.com/2">Aloha!</a></p>'
    ));
});
