// Local names of Web Chat CSS modules that each Fluent CSS module styles, kept sorted.
// FluentThemeProvider passes Fluent's class names for them to Web Chat's useStyles() through <CSSModuleThemeComposer>,
// so Fluent rules select them as local names (`.thumb-button`), not as readable class names (`:global(.thumb-button)`).
// fluentCSSModuleOverrides.spec.ts checks these lists against the CSS.

// PartGroupingDecorator.module.css
const partGroupingDecoratorOverrides: readonly string[] = Object.freeze([
  'activity-button',
  'activity-button__text',
  'adaptive-card-renderer',
  'adaptive-card-renderer__action--selected',
  'bubble',
  'bubble__content',
  'collapsible-content',
  'collapsible-content__chevron',
  'collapsible-content__content',
  'collapsible-content__summary',
  'collapsible-grouping',
  'collapsible-grouping--open',
  'collapsible-grouping__chevron',
  'collapsible-grouping__content',
  'collapsible-grouping__content--open',
  'collapsible-grouping__header',
  'collapsible-grouping__list',
  'collapsible-grouping__title',
  'link-definitions',
  'link-definitions__badge',
  'link-definitions__header',
  'link-definitions__header-chevron',
  'link-definitions__header-text',
  'link-definitions__list',
  'link-definitions__list-item',
  'link-definitions__list-item-badge',
  'link-definitions__list-item-body',
  'link-definitions__list-item-box',
  'link-definitions__list-item-main-text',
  'link-definitions__list-item-text',
  'link-definitions__message-sensitivity-label-text',
  'link-definitions__open-in-new-window-icon',
  'part-grouping-activity__activities',
  'render-markdown',
  'stacked-layout',
  'stacked-layout__attachment-row',
  'stacked-layout__bubble',
  'text-content',
  'text-content__generated-badge'
]);

// SendBox.module.css
const sendBoxOverrides: readonly string[] = Object.freeze([]);

// Theme.module.css
const themeOverrides: readonly string[] = Object.freeze([
  'activity-button',
  'activity-button__icon',
  'animated-image-content__button',
  'collapsible-grouping',
  'transcript-focus-area',
  'transcript-focus-area__content--focused'
]);

export { partGroupingDecoratorOverrides, sendBoxOverrides, themeOverrides };
