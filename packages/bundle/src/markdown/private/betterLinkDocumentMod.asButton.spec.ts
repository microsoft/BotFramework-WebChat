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

describe('When passing "asButton" option with true', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { asButton: true };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFragmentFromString(BASE_HTML), () => decoration);
  });

  test('should replace with <button type="button">', () =>
    expect(actual.querySelector('button').getAttribute('type')).toBe('button'));

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml"><button type="button" value="https://example.com">Example</button></p>'
    ));

  test('should match baseline', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      serializeDocumentFragmentIntoString(
        parseDocumentFragmentFromString(new MarkdownIt().use(betterLink, () => decoration).render(BASE_MARKDOWN))
      )
    ));
});

describe('When passing "asButton" option with true and "iconClassName" with "my-icon"', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { asButton: true, iconClassName: 'my-icon' };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFragmentFromString(BASE_HTML), () => decoration);
  });

  test('should replace with <button type="button">', () =>
    expect(actual.querySelector('button').getAttribute('type')).toBe('button'));

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml"><button type="button" value="https://example.com">Example<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" class="my-icon" /></button></p>'
    ));

  test('should match baseline', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      serializeDocumentFragmentIntoString(
        parseDocumentFragmentFromString(new MarkdownIt().use(betterLink, () => decoration).render(BASE_MARKDOWN))
      )
    ));
});

describe('When passing "asButton" option with true and "title" with "Hello, World!"', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { asButton: true, title: 'Hello, World!' };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFragmentFromString(BASE_HTML), () => decoration);
  });

  test('should replace with <button type="button" title="Hello, World!">', () => {
    expect(actual.querySelector('button').getAttribute('type')).toBe('button');
    expect(actual.querySelector('button').getAttribute('title')).toBe('Hello, World!');
  });

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml"><button title="Hello, World!" type="button" value="https://example.com">Example</button></p>'
    ));

  test('should match baseline', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      serializeDocumentFragmentIntoString(
        parseDocumentFragmentFromString(new MarkdownIt().use(betterLink, () => decoration).render(BASE_MARKDOWN))
      )
    ));
});

describe('When passing "asButton" option with true and "className" with "my-link"', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { asButton: true, className: 'my-link' };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFragmentFromString(BASE_HTML), () => decoration);
  });

  test('should replace with <button type="button" class="my-link">', () => {
    expect(actual.querySelector('button').getAttribute('type')).toBe('button');
    expect(actual.querySelector('button').getAttribute('class')).toBe('my-link');
  });

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml"><button class="my-link" type="button" value="https://example.com">Example</button></p>'
    ));

  test('should match baseline', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      serializeDocumentFragmentIntoString(
        parseDocumentFragmentFromString(new MarkdownIt().use(betterLink, () => decoration).render(BASE_MARKDOWN))
      )
    ));
});

describe('When passing "asButton" option with true and "aria-label" with "Hello, World!"', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { asButton: true, ariaLabel: 'Hello, World!' };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFragmentFromString(BASE_HTML), () => decoration);
  });

  test('should replace with <button type="button" aria-label="Hello, World!">', () => {
    expect(actual.querySelector('button').getAttribute('type')).toBe('button');
    expect(actual.querySelector('button').getAttribute('aria-label')).toBe('Hello, World!');
  });

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml"><button aria-label="Hello, World!" type="button" value="https://example.com">Example</button></p>'
    ));

  test('should match baseline', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      serializeDocumentFragmentIntoString(
        parseDocumentFragmentFromString(new MarkdownIt().use(betterLink, () => decoration).render(BASE_MARKDOWN))
      )
    ));
});
