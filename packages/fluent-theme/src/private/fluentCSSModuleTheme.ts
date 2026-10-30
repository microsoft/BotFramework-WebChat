import { combineCSSModules } from 'botframework-webchat/internal.js';

import partGroupingDecoratorStyles from '../components/activity/PartGroupingDecorator.module.css';
import themeStyles from '../components/theme/Theme.module.css';
import { partGroupingDecoratorOverrides, themeOverrides } from './fluentCSSModuleOverrides';
import pickCSSModule from './pickCSSModule';

// Fluent's class names for the Web Chat elements it styles, for <CSSModuleThemeComposer> in FluentThemeProvider.
// Built once, so every useStyles() below the composer gets a stable theme.
const fluentCSSModuleTheme = combineCSSModules(
  pickCSSModule(partGroupingDecoratorStyles, partGroupingDecoratorOverrides),
  pickCSSModule(themeStyles, themeOverrides)
);

export default fluentCSSModuleTheme;
