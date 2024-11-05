// `shiki/core` entry does not include any themes or languages or the wasm binary.
import { createHighlighterCore, type ThemeRegistrationRaw } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine-javascript.mjs';

// directly import the theme and language modules, only the ones you imported will be bundled.
import themeGitHubDark from 'shiki/themes/github-dark-default.mjs';
import themeGitHubLight from 'shiki/themes/github-light-default.mjs';

import languageJavaScript from 'shiki/langs/js.mjs';
import languagePython from 'shiki/langs/py.mjs';
import languageTypeScript from 'shiki/langs/ts.mjs';

function addjustTheme(theme: ThemeRegistrationRaw): ThemeRegistrationRaw {
  return {
    ...theme,
    colors: {
      ...theme.colors,
      'editor.background': `var(--webchat__code-block--background, ${theme.colors['editor.background']})`
    }
  };
}

function createHighlighter() {
  return createHighlighterCore({
    themes: [addjustTheme(themeGitHubDark), addjustTheme(themeGitHubLight)],
    langs: [languageJavaScript, languagePython, languageTypeScript],
    engine: createJavaScriptRegexEngine()
  });
}

export default createHighlighter;
