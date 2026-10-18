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
    themes: [
      adjustTheme(themeGitHubDark),
      adjustTheme({
        ...themeGitHubLight,
        // Comments (#6e7781) are 4.36:1 on the Fluent theme code block background (#fafafa), below 4.5:1 (WCAG 1.4.3).
        // Use the muted text color of the theme instead (#656d76): 5.03:1 on #fafafa, 5.25:1 on #ffffff.
        // Other token colors of JavaScript, Python, and TypeScript are at least 4.83:1 (light) and 5.99:1 (dark).
        colorReplacements: { '#6e7781': '#656d76' }
      })
    ]
  });
}

export default createHighlighter;
