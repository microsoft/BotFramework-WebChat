// Local names of Web Chat CSS modules that each Fluent CSS module styles, kept sorted.
// FluentThemeProvider passes Fluent's class names for them to Web Chat's useStyles() through <CSSModuleThemeComposer>,
// so Fluent rules select them as local names (`.thumb-button`), not as readable class names (`:global(.thumb-button)`).
// fluentCSSModuleOverrides.spec.ts checks these lists against the CSS.

// PartGroupingDecorator.module.css
const partGroupingDecoratorOverrides: readonly string[] = Object.freeze([
  'activity-status',
  'border-flair',
  'bubble',
  'bubble--from-user',
  'bubble__content',
  'carousel-filmstrip__alignment-pad',
  'carousel-filmstrip__avatar-gutter',
  'carousel-layout',
  'code-block-content',
  'code-block-content__code-block',
  'code-block-content__header',
  'code-block-copy-button',
  'component-icon',
  'message-status-loader',
  'stacked-layout',
  'stacked-layout--no-message',
  'stacked-layout__attachment',
  'stacked-layout__attachment-list',
  'stacked-layout__attachment-row',
  'stacked-layout__bubble',
  'stacked-layout__content',
  'stacked-layout__main',
  'stacked-layout__message-status',
  'stacked-layout__message-status--incomplete',
  'stacked-layout__status',
  'stacked-layout__title',
  'transcript-focus-area__activity-list'
]);

// SendBox.module.css
const sendBoxOverrides: readonly string[] = Object.freeze([
  'send-box-attachment-bar',
  'send-box-attachment-bar--as-list-item',
  'send-box-attachment-bar-item',
  'send-box-attachment-bar-item--as-list-item',
  'send-box-attachment-bar-item--as-thumbnail',
  'send-box-attachment-bar-item-file-preview',
  'send-box-attachment-bar-item-file-preview--as-list-item',
  'send-box-attachment-bar-item__delete-button',
  'send-box-attachment-bar-item__preview',
  'send-box-attachment-bar__box'
]);

// Theme.module.css
const themeOverrides: readonly string[] = Object.freeze([
  'bubble',
  'bubble__content',
  'bubble__nub-pad',
  'code-block',
  'code-block-content',
  'code-block-content__code-block',
  'code-block-copy-button',
  'code-block-copy-button__icon',
  'code-block__body',
  'code-block__theme--github-dark-default',
  'code-block__theme--github-light-default',
  'feedback-form',
  'feedback-form__cancel-button',
  'feedback-form__form',
  'feedback-form__form-footer',
  'feedback-form__form-header',
  'feedback-form__submit-button',
  'feedback-form__text-box',
  'send-box-attachment-bar',
  'send-box-attachment-bar--as-list-item',
  'text-area',
  'text-area--scroll',
  'text-area-input',
  'thumb-button',
  'thumb-button--large',
  'thumb-button__image',
  'thumb-button__input',
  'transcript-focus-area',
  'transcript-focus-area__content--focused',
  'transcript-focus-area__content-overlay',
  'transcript-focus-area__indicator',
  'transcript-focus-area__transcript-indicator',
  'view-code-dialog',
  'view-code-dialog__body',
  'view-code-dialog__footer',
  'view-code-dialog__title'
]);

export { partGroupingDecoratorOverrides, sendBoxOverrides, themeOverrides };
