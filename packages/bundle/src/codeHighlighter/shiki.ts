// `shiki/core` entry does not include any themes or languages or the wasm binary.
import { createHighlighterCore, type DynamicImportThemeRegistration, type ThemeRegistration } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

// directly import the theme and language modules, only the ones you imported will be bundled.

// TODO: [P*] Check if this hurts tree shaking.
import { bundledLanguages } from 'shiki/langs';
import { bundledThemes } from 'shiki/themes';

async function adjustTheme(getTheme: DynamicImportThemeRegistration): Promise<ThemeRegistration> {
  const { default: theme } = await getTheme();

  return {
    ...theme,
    colors: {
      ...theme.colors,
      'editor.background': `transparent`
    }
  };
}

async function createHighlighter() {
  return createHighlighterCore({
    themes: [
      await adjustTheme(bundledThemes['github-dark-default']),
      await adjustTheme(bundledThemes['github-light-default'])
    ],
    langs: [bundledLanguages.javascript, bundledLanguages.python, bundledLanguages.typescript],
    engine: createJavaScriptRegexEngine()
  });
}

export default createHighlighter;
