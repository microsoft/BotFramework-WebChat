// Local names of Web Chat CSS modules that each Fluent CSS module styles, kept sorted.
// FluentThemeProvider passes Fluent's class names for them to Web Chat's useStyles() through <CSSModuleThemeComposer>,
// so Fluent rules select them as local names (`.thumb-button`), not as readable class names (`:global(.thumb-button)`).
// fluentCSSModuleOverrides.spec.js checks these lists against the CSS.

const themeOverrides: readonly string[] = Object.freeze([
  // Feedback
  'feedback-form',
  'feedback-form__cancel-button',
  'feedback-form__form',
  'feedback-form__form-footer',
  'feedback-form__form-header',
  'feedback-form__submit-button',
  'feedback-form__text-box',
  'thumb-button',
  'thumb-button--large',
  'thumb-button__image',
  'thumb-button__input'
]);

export { themeOverrides };
