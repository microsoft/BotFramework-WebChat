// `shiki/core` entry does not include any themes or languages or the wasm binary.
import { createHighlighterCore, type ThemeRegistrationRaw } from 'shiki/dist/core.mjs';
import { createJavaScriptRegexEngine } from 'shiki/dist/engine-javascript.mjs';

// directly import the theme and language modules, only the ones you imported will be bundled.
import themeGitHubDark from 'shiki/dist/themes/github-dark-default.mjs';
import themeGitHubLight from 'shiki/dist/themes/github-light-default.mjs';

import languageJavaScript from 'shiki/dist/langs/js.mjs';
import languagePython from 'shiki/dist/langs/py.mjs';
import languageTypeScript from 'shiki/dist/langs/ts.mjs';

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
