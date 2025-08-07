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

describe('When passing "wrapZeroWidthSpace" option with true', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { wrapZeroWidthSpace: true };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFragmentFromString(baseHTML), () => decoration);
  });

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml">\u200b<a href="https://example.com">Example</a>\u200b</p>'
    ));
});

describe('When passing "wrapZeroWidthSpace" option with true and "asButton" option with true', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { asButton: true, wrapZeroWidthSpace: true };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFragmentFromString(baseHTML), () => decoration);
  });

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml">\u200b<button type="button" value="https://example.com">Example</button>\u200b</p>'
    ));
});
