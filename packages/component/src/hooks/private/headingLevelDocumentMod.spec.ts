/** @jest-environment @happy-dom/jest-environment */

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import headingLevelDocumentMod from './headingLevelDocumentMod';

function createElement(innerHTML: string): HTMLDivElement {
  const element = document.createElement('div');

  element.innerHTML = innerHTML;

  return element;
}

scenario(
  'headings written in Markdown',
  bdd => {
    bdd
      .given('every heading level', () => createElement('<h1>A</h1><h2>B</h2><h3>C</h3><h4>D</h4><h5>E</h5><h6>F</h6>'))
      .when('starting at level 2', element => headingLevelDocumentMod(element, 2))
      .then('should move every heading one level down, beyond <h6> as role="heading"', (_, actual) =>
        expect(actual.innerHTML).toBe(
          '<h2 class="render-markdown__heading--level-1">A</h2>' +
            '<h3 class="render-markdown__heading--level-2">B</h3>' +
            '<h4 class="render-markdown__heading--level-3">C</h4>' +
            '<h5 class="render-markdown__heading--level-4">D</h5>' +
            '<h6 class="render-markdown__heading--level-5">E</h6>' +
            '<div aria-level="7" role="heading" class="render-markdown__heading--level-6">F</div>'
        )
      )
      .and('should keep the result when running again', (_, actual) =>
        expect(headingLevelDocumentMod(createElement(actual.innerHTML), 2).innerHTML).toBe(actual.innerHTML)
      );

    bdd
      .given('top heading written as "##"', () => createElement('<h2>A</h2><h3>B</h3>'))
      .when('starting at level 1', element => headingLevelDocumentMod(element, 1))
      .then('should move the top heading to level 1 and keep the depth of the other', (_, actual) =>
        expect(actual.innerHTML).toBe(
          '<h1 class="render-markdown__heading--level-2">A</h1><h2 class="render-markdown__heading--level-3">B</h2>'
        )
      );

    bdd
      .given('headings already at the right level', () => createElement('<h2>A</h2><h3>B</h3>'))
      .when('starting at level 2', element => headingLevelDocumentMod(element, 2))
      .then('should not touch them', (_, actual) => expect(actual.innerHTML).toBe('<h2>A</h2><h3>B</h3>'));

    bdd
      .given('no headings', () => createElement('<p>A</p>'))
      .when('starting at level 2', element => headingLevelDocumentMod(element, 2))
      .then('should not touch the content', (_, actual) => expect(actual.innerHTML).toBe('<p>A</p>'));
  },
  JestGlobals
);

scenario(
  'class names marking the written level',
  bdd => {
    bdd
      .given('a marked heading with other class names', () =>
        createElement(
          '<h1>A</h1><div aria-level="7" class="extra render-markdown__heading--level-2 more" role="heading">B</div>'
        )
      )
      .when('starting at level 2', element => headingLevelDocumentMod(element, 2))
      .then('should read the written level from the exact class name', (_, actual) =>
        expect(actual.innerHTML).toBe(
          '<h2 class="render-markdown__heading--level-1">A</h2><h3 class="render-markdown__heading--level-2">B</h3>'
        )
      );

    bdd
      .given('a heading whose class names only look like the marker', () =>
        createElement(
          // Prefixed and suffixed: not the marker, so the written level comes from the tag name.
          '<h3 class="xrender-markdown__heading--level-1 render-markdown__heading--level-1x">A</h3>'
        )
      )
      .when('starting at level 1', element => headingLevelDocumentMod(element, 1))
      .then('should use the tag name', (_, actual) =>
        expect(actual.innerHTML).toBe('<h1 class="render-markdown__heading--level-3">A</h1>')
      );

    for (const className of [
      'render-markdown__heading--level-something',
      'render-markdown__heading--level-',
      'render-markdown__heading--level-0',
      'render-markdown__heading--level-1.5',
      'render-markdown__heading--level-7', // Markdown has no "#######", the mod never writes it.
      '' // No class name.
    ]) {
      const html = `<h2>A</h2><div aria-level="3" class="${className}" role="heading">B</div>`;

      bdd
        .given(`<div role="heading" class="${className}">`, () => createElement(html))
        .when('starting at level 2', element => headingLevelDocumentMod(element, 2))
        .then('should leave it as-is and not change the level of other headings', (_, actual) =>
          expect(actual.innerHTML).toBe(html)
        )
        .and('should not produce NaN', (_, actual) => expect(actual.innerHTML).not.toContain('NaN'));
    }
  },
  JestGlobals
);
