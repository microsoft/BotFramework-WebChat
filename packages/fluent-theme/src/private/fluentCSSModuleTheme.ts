import { combineCSSModules } from 'botframework-webchat/internal.js';

import themeStyles from '../components/theme/Theme.module.css';
import { themeOverrides } from './fluentCSSModuleOverrides';
import pickCSSModule from './pickCSSModule';

// Fluent's class names for the Web Chat elements it styles, for <CSSModuleThemeComposer> in FluentThemeProvider.
// Built once, so every useStyles() below the composer gets a stable theme.
const fluentCSSModuleTheme = combineCSSModules(pickCSSModule(themeStyles, themeOverrides));

export default fluentCSSModuleTheme;
