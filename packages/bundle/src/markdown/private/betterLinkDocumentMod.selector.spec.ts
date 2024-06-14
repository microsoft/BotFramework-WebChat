/** @jest-environment jsdom */

import { parseDocumentFromString } from 'botframework-webchat-component/internal/parseDocumentFromString';
import { serializeDocumentIntoString } from 'botframework-webchat-component/internal/serializeDocumentIntoString';
import MarkdownIt from 'markdown-it';
import betterLink from '../markdownItPlugins/betterLink';
import betterLinkDocumentMod, { type BetterLinkDocumentModDecoration } from './betterLinkDocumentMod';

const BASE_MARKDOWN = '[Hello, World!](https://example.com/1)\n\n[Aloha!](https://example.com/2)';
const BASE_HTML = new MarkdownIt().render(BASE_MARKDOWN);

describe('When passing "ariaLabel" option with "Hello, World!" for a specific anchor based on "href"', () => {
  let actual: Document;
  const decoration: BetterLinkDocumentModDecoration = { ariaLabel: 'Hello, World!' };

  beforeEach(() => {
    actual = betterLinkDocumentMod(
      parseDocumentFromString(BASE_HTML),
      href => href === 'https://example.com/1' && decoration
    );
  });

  test('should have "aria-label" attribute set to "Hello, World!"', () =>
    expect(actual.querySelector('a').getAttribute('aria-label')).toBe('Hello, World!'));

  test('should match snapshot', () =>
    expect(serializeDocumentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml"><a href="https://example.com/1" aria-label="Hello, World!">Hello, World!</a></p>\n<p xmlns="http://www.w3.org/1999/xhtml"><a href="https://example.com/2">Aloha!</a></p>\n'
    ));

  test('should match baseline', () =>
    expect(serializeDocumentIntoString(actual)).toBe(
      serializeDocumentIntoString(
        parseDocumentFromString(
          new MarkdownIt()
            .use(betterLink, (_, textContent) => textContent === 'Hello, World!' && decoration)
            .render(BASE_MARKDOWN)
        )
      )
    ));
});

describe('When passing "ariaLabel" option with "Hello, World!" for a specific anchor based on "textContent"', () => {
  let actual: Document;
  const decoration: BetterLinkDocumentModDecoration = { ariaLabel: 'Hello, World!' };

  beforeEach(() => {
    actual = betterLinkDocumentMod(
      parseDocumentFromString(BASE_HTML),
      (_, textContent) => textContent === 'Hello, World!' && decoration
    );
  });

  test('should have "aria-label" attribute set to "Hello, World!"', () =>
    expect(actual.querySelector('a').getAttribute('aria-label')).toBe('Hello, World!'));

  test('should match snapshot', () =>
    expect(serializeDocumentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml"><a href="https://example.com/1" aria-label="Hello, World!">Hello, World!</a></p>\n<p xmlns="http://www.w3.org/1999/xhtml"><a href="https://example.com/2">Aloha!</a></p>\n'
    ));

  test('should match baseline', () =>
    expect(serializeDocumentIntoString(actual)).toBe(
      serializeDocumentIntoString(
        parseDocumentFromString(
          new MarkdownIt()
            .use(betterLink, (_, textContent) => textContent === 'Hello, World!' && decoration)
            .render(BASE_MARKDOWN)
        )
      )
    ));
});
