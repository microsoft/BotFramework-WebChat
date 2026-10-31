import { combineCSSModules } from 'botframework-webchat/internal.js';

import partGroupingDecoratorStyles from '../components/activity/PartGroupingDecorator.module.css';
import themeStyles from '../components/theme/Theme.module.css';
import codeBlockContentOverrideStyles from '../overrides/CodeBlockContent.module.css';
import codeBlockCopyButtonOverrideStyles from '../overrides/CodeBlockCopyButton.module.css';
import attachmentBarOverrideStyles from '../overrides/AttachmentBar.module.css';
import attachmentBarItemOverrideStyles from '../overrides/AttachmentBarItem.module.css';
import filePreviewOverrideStyles from '../overrides/FilePreview.module.css';
import textAreaOverrideStyles from '../overrides/TextArea.module.css';
import codeBlockOverrideStyles from '../overrides/CodeBlock.module.css';
import viewCodeDialogOverrideStyles from '../overrides/ViewCodeDialog.module.css';
import thumbButtonOverrideStyles from '../overrides/ThumbButton.module.css';
import feedbackFormOverrideStyles from '../overrides/FeedbackForm.module.css';
import { partGroupingDecoratorOverrides, themeOverrides } from './fluentCSSModuleOverrides';
import pickCSSModule from './pickCSSModule';

// Fluent's class names for the Web Chat elements it styles, for <CSSModuleThemeComposer> in FluentThemeProvider.
// Each override module mirrors one Web Chat CSS module and is passed whole, in the order its rules had in
// Fluent's CSS, to keep the cascade. Built once, so every useStyles() below the composer gets a stable theme.
const fluentCSSModuleTheme = combineCSSModules(
  pickCSSModule(partGroupingDecoratorStyles, partGroupingDecoratorOverrides),
  pickCSSModule(themeStyles, themeOverrides),
  codeBlockContentOverrideStyles,
  codeBlockCopyButtonOverrideStyles,
  attachmentBarOverrideStyles,
  attachmentBarItemOverrideStyles,
  filePreviewOverrideStyles,
  textAreaOverrideStyles,
  codeBlockOverrideStyles,
  viewCodeDialogOverrideStyles,
  thumbButtonOverrideStyles,
  feedbackFormOverrideStyles
);

export default fluentCSSModuleTheme;
