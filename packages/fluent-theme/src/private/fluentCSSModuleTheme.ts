import { combineCSSModules } from 'botframework-webchat/internal.js';

import partGroupingDecoratorStyles from '../components/activity/PartGroupingDecorator.module.css';
import sendBoxStyles from '../components/sendBox/SendBox.module.css';
import themeStyles from '../components/theme/Theme.module.css';
import thumbButtonOverrideStyles from '../overrides/ThumbButton.module.css';
import feedbackFormOverrideStyles from '../overrides/FeedbackForm.module.css';
import { partGroupingDecoratorOverrides, sendBoxOverrides, themeOverrides } from './fluentCSSModuleOverrides';
import pickCSSModule from './pickCSSModule';

// Fluent's class names for the Web Chat elements it styles, for <CSSModuleThemeComposer> in FluentThemeProvider.
// Each override module mirrors one Web Chat CSS module and is passed whole, in the order its rules had in
// Fluent's CSS, to keep the cascade. Built once, so every useStyles() below the composer gets a stable theme.
const fluentCSSModuleTheme = combineCSSModules(
  pickCSSModule(partGroupingDecoratorStyles, partGroupingDecoratorOverrides),
  pickCSSModule(sendBoxStyles, sendBoxOverrides),
  pickCSSModule(themeStyles, themeOverrides),
  thumbButtonOverrideStyles,
  feedbackFormOverrideStyles
);

export default fluentCSSModuleTheme;
