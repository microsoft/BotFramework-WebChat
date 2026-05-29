/** @jest-environment @happy-dom/jest-environment */

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import { micromark } from 'micromark';
import betterLinkDocumentMod from './betterLinkDocumentMod';
import parseDocumentFragmentFromString from './parseDocumentFragmentFromString';
import serializeDocumentFragmentIntoString from './serializeDocumentFragmentIntoString';

scenario(
  '"dataset" option',
  bdd => {
    bdd
      .given('the document fragment', () => ({
        documentFragment: parseDocumentFragmentFromString(
          micromark('[Example](https://example.com)', { allowDangerousHtml: true })
        )
      }))
      .when('passing "attributes"', ({ documentFragment }) =>
        betterLinkDocumentMod(documentFragment, () => ({
          dataset: { hello: 'World!' }
        }))
      )
      .then('should match snapshot', (_, actual) => {
        expect(serializeDocumentFragmentIntoString(actual)).toBe(
          '<p xmlns="http://www.w3.org/1999/xhtml"><a href="https://example.com" data-hello="World!">Example</a></p>'
        );
      });
  },
  JestGlobals
);

scenario(
  '"dataset" option with "asButton: true"',
  bdd => {
    bdd
      .given('the document fragment', () => ({
        documentFragment: parseDocumentFragmentFromString(
          micromark('[Example](https://example.com)', { allowDangerousHtml: true })
        )
      }))
      .when('passing "attributes"', ({ documentFragment }) =>
        betterLinkDocumentMod(documentFragment, () => ({
          asButton: true,
          dataset: { hello: 'World!' }
        }))
      )
      .then('should match snapshot', (_, actual) => {
        expect(serializeDocumentFragmentIntoString(actual)).toBe(
          '<p xmlns="http://www.w3.org/1999/xhtml"><button type="button" value="https://example.com" data-hello="World!">Example</button></p>'
        );
      });
  },
  JestGlobals
);
