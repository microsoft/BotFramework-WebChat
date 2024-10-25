// `shiki/core` entry does not include any themes or languages or the wasm binary.
import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine-javascript.mjs';

// directly import the theme and language modules, only the ones you imported will be bundled.
import ghLight from 'shiki/themes/github-light-default.mjs';
import ghDark from 'shiki/themes/github-dark-default.mjs';

import langJS from 'shiki/langs/js.mjs';
import langTS from 'shiki/langs/ts.mjs';
import langPy from 'shiki/langs/py.mjs';

function createHighlighter() {
  return createHighlighterCore({
    themes: [
      // instead of strings, you need to pass the imported module
      ghLight,
      ghDark
    ],
    langs: [langJS, langTS, langPy],
    engine: createJavaScriptRegexEngine()
  });
}

export default createHighlighter;
