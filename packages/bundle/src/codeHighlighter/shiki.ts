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

import ensureContrast from './private/ensureContrast.js';

// Web Chat paints the background of the code block, the background of the theme is transparent.
// Token colors are adjusted to at least 4.5:1 (WCAG 1.4.3) against the code block background closest to them:
// Fluent theme's #fafafa (light) and #141414 (dark), the default theme uses #ffffff and #0d1117 from the themes.
// For example, comments in "github-light-default" (#6e7781) are 4.55:1 on #ffffff but 4.36:1 on #fafafa.
function adjustTheme(theme: ThemeRegistration, background: string): ThemeRegistration {
  return {
    ...theme,
    colorReplacements: {
      ...theme.colorReplacements,
      ...Object.fromEntries(
        // Each distinct color once: many token rules share a color.
        Array.from(
          new Set(
            [
              theme.colors?.['editor.foreground'],
              ...(theme.settings ?? theme.tokenColors ?? []).map(({ settings }) => settings.foreground)
            ]
              .filter((color): color is string => !!color)
              .map(color => color.toLowerCase())
          ),
          color => [color, ensureContrast(color, background, theme.type === 'dark' ? 'lighten' : 'darken')]
        ).filter(([color, replacement]) => color !== replacement)
      )
    },
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
    // Backgrounds of the Fluent theme: `--webchat-colorGrey8` (dark) and `--webchat-colorGrey98` (light).
    themes: [adjustTheme(themeGitHubDark, '#141414'), adjustTheme(themeGitHubLight, '#fafafa')]
  });
}

export default createHighlighter;
