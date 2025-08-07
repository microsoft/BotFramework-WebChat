/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import {
  parseDocumentFragmentFromString,
  serializeDocumentFragmentIntoString
} from 'botframework-webchat-component/internal';
import { micromark } from 'micromark';
import betterLinkDocumentMod, { type BetterLinkDocumentModDecoration } from './betterLinkDocumentMod';

const BASE_MARKDOWN = '[Example](https://example.com)';
let baseHTML;

beforeEach(() => {
  baseHTML = micromark(BASE_MARKDOWN, { allowDangerousHtml: true });
});

describe('When passing "iconAlt" option with "Hello, World!" and "iconClassName" with "my-icon"', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { iconAlt: 'Hello, World!', iconClassName: 'my-icon' };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFragmentFromString(baseHTML), () => decoration);
  });

  test('should have icon image with "alt" attribute set to empty string', () =>
    expect(actual.querySelector('img').getAttribute('alt')).toBe(''));

  test('should have icon image with "class" attribute set to "my-icon"', () =>
    expect(actual.querySelector('img').classList.contains('my-icon')).toBe(true));

  test('should have icon image with "src" attribute set to a transparent GIF', () =>
    expect(actual.querySelector('img').getAttribute('src')).toBe(
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    ));

  test('should have icon image with "title" attribute set to "Hello, World!"', () =>
    expect(actual.querySelector('img').getAttribute('title')).toBe('Hello, World!'));

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml"><a href="https://example.com">Example<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" class="my-icon" title="Hello, World!" /></a></p>'
    ));
});
