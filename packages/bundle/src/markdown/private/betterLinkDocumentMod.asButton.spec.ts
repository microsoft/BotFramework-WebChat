/// <reference types="jest" />
/** @jest-environment @happy-dom/jest-environment */

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

describe('When passing "asButton" option with true', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { asButton: true };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFragmentFromString(baseHTML), () => decoration);
  });

  test('should replace with <button type="button">', () =>
    expect(actual.querySelector('button').getAttribute('type')).toBe('button'));

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml"><button type="button" value="https://example.com">Example</button></p>'
    ));
});

describe('When passing "asButton" option with true and "iconClassName" with "my-icon"', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { asButton: true, iconClassName: 'my-icon' };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFragmentFromString(baseHTML), () => decoration);
  });

  test('should replace with <button type="button">', () =>
    expect(actual.querySelector('button').getAttribute('type')).toBe('button'));

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml"><button type="button" value="https://example.com">Example<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" class="my-icon" /></button></p>'
    ));
});

describe('When passing "asButton" option with true and "title" with "Hello, World!"', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { asButton: true, title: 'Hello, World!' };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFragmentFromString(baseHTML), () => decoration);
  });

  test('should replace with <button type="button" title="Hello, World!">', () => {
    expect(actual.querySelector('button').getAttribute('type')).toBe('button');
    expect(actual.querySelector('button').getAttribute('title')).toBe('Hello, World!');
  });

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml"><button title="Hello, World!" type="button" value="https://example.com">Example</button></p>'
    ));
});

describe('When passing "asButton" option with true and "className" with "my-link"', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { asButton: true, className: 'my-link' };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFragmentFromString(baseHTML), () => decoration);
  });

  test('should replace with <button type="button" class="my-link">', () => {
    expect(actual.querySelector('button').getAttribute('type')).toBe('button');
    expect(actual.querySelector('button').getAttribute('class')).toBe('my-link');
  });

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml"><button class="my-link" type="button" value="https://example.com">Example</button></p>'
    ));
});

describe('When passing "asButton" option with true and "aria-label" with "Hello, World!"', () => {
  let actual: DocumentFragment;
  const decoration: BetterLinkDocumentModDecoration = { asButton: true, ariaLabel: 'Hello, World!' };

  beforeEach(() => {
    actual = betterLinkDocumentMod(parseDocumentFragmentFromString(baseHTML), () => decoration);
  });

  test('should replace with <button type="button" aria-label="Hello, World!">', () => {
    expect(actual.querySelector('button').getAttribute('type')).toBe('button');
    expect(actual.querySelector('button').getAttribute('aria-label')).toBe('Hello, World!');
  });

  test('should match snapshot', () =>
    expect(serializeDocumentFragmentIntoString(actual)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml"><button aria-label="Hello, World!" type="button" value="https://example.com">Example</button></p>'
    ));
});
