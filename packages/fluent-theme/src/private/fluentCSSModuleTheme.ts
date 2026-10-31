import { combineCSSModules } from 'botframework-webchat/internal.js';

import overrideStyles from './fluentCSSModuleTheme.module.css';

// Fluent's class names for the Web Chat elements it styles, for <CSSModuleThemeComposer> in FluentThemeProvider.
// One CSS module holds every Fluent rule for Web Chat elements and is passed whole. Its scope classes (e.g. ".theme")
// also reach Fluent's elements, which declare the same local names in their own CSS modules.
// Built once, so every useStyles() below the composer gets a stable theme.
const fluentCSSModuleTheme = combineCSSModules(overrideStyles);

export default fluentCSSModuleTheme;
