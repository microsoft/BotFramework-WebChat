// `shiki/core` entry does not include any themes or languages or the wasm binary.
import { createHighlighterCore, type ThemeRegistration } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

// Directly import the theme and language modules, only the ones you imported will be bundled.

// Named import vs. file-based import:
// - Named imports
//   - webchat*.js file size is the same, tree shaking is good
//   - It emits more *.mjs files, huge tarball size
// - File-based imports
//   - It emits less *.mjs files, good tarball size
import languageJavaScript from 'shiki/langs/js.mjs';
import languagePython from 'shiki/langs/py.mjs';
import languageTypeScript from 'shiki/langs/ts.mjs';
import themeGitHubDark from 'shiki/themes/github-dark-default.mjs';
import themeGitHubLight from 'shiki/themes/github-light-default.mjs';

function adjustTheme(theme: ThemeRegistration): ThemeRegistration {
  return {
    ...theme,
    colors: {
      ...theme.colors,
      'editor.background': `transparent`
    }
  };
}

function createHighlighter() {
  return createHighlighterCore({
    engine: createJavaScriptRegexEngine(),
    langs: [languageJavaScript, languagePython, languageTypeScript],
    themes: [adjustTheme(themeGitHubDark), adjustTheme(themeGitHubLight)]
  });
}

export default createHighlighter;
