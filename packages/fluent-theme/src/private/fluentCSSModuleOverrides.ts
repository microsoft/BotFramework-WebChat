// Local names of Web Chat CSS modules that each Fluent CSS module styles, kept sorted.
// FluentThemeProvider passes Fluent's class names for them to Web Chat's useStyles() through <CSSModuleThemeComposer>,
// so Fluent rules select them as local names (`.thumb-button`), not as readable class names (`:global(.thumb-button)`).
// fluentCSSModuleOverrides.spec.ts checks these lists against the CSS.

// PartGroupingDecorator.module.css
const partGroupingDecoratorOverrides: readonly string[] = Object.freeze([
  'code-block-content',
  'code-block-content__code-block',
  'code-block-content__header',
  'code-block-copy-button'
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
  'view-code-dialog',
  'view-code-dialog__body',
  'view-code-dialog__footer',
  'view-code-dialog__title'
]);

export { partGroupingDecoratorOverrides, sendBoxOverrides, themeOverrides };
