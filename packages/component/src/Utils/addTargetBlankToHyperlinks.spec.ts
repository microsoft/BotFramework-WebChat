/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import { micromark } from 'micromark';

import {
  parseDocumentFragmentFromString,
  serializeDocumentFragmentIntoString
} from '@msinternal/botframework-webchat-component-better-link';
import addTargetBlankToHyperlinks from './addTargetBlankToHyperlinks';

test('add to external links', () => {
  const documentFragment = parseDocumentFragmentFromString(micromark('Hello, [Microsoft](https://microsoft.com/)!'));

  addTargetBlankToHyperlinks(documentFragment);

  const actual = serializeDocumentFragmentIntoString(documentFragment);

  expect(actual).toBe(
    '<p xmlns="http://www.w3.org/1999/xhtml">Hello, <a href="https://microsoft.com/" rel="noopener noreferrer" target="_blank">Microsoft</a>!</p>'
  );
});

test("don't add for hashes", () => {
  const documentFragment = parseDocumentFragmentFromString(micromark('Hello, [Microsoft](#microsoft)!'));

  addTargetBlankToHyperlinks(documentFragment);

  const actual = serializeDocumentFragmentIntoString(documentFragment);

  expect(actual).toBe(`<p xmlns="http://www.w3.org/1999/xhtml">Hello, <a href="#microsoft">Microsoft</a>!</p>`);
});

test("don't add for searches", () => {
  const documentFragment = parseDocumentFragmentFromString(micromark('Hello, [Microsoft](?q=microsoft)!'));

  addTargetBlankToHyperlinks(documentFragment);

  const actual = serializeDocumentFragmentIntoString(documentFragment);

  expect(actual).toBe(`<p xmlns="http://www.w3.org/1999/xhtml">Hello, <a href="?q=microsoft">Microsoft</a>!</p>`);
});

test("don't add for cross references", () => {
  const documentFragment = parseDocumentFragmentFromString(micromark('Hello, [Microsoft]!\n\n[Microsoft]: #microsoft'));

  addTargetBlankToHyperlinks(documentFragment);

  const actual = serializeDocumentFragmentIntoString(documentFragment);

  expect(actual).toBe(`<p xmlns="http://www.w3.org/1999/xhtml">Hello, <a href="#microsoft">Microsoft</a>!</p>\n`);
});
