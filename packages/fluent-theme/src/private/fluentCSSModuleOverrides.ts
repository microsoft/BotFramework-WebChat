// Local names of Web Chat CSS modules that each Fluent CSS module styles, kept sorted.
// FluentThemeProvider passes Fluent's class names for them to Web Chat's useStyles() through <CSSModuleThemeComposer>,
// so Fluent rules select them as local names (`.thumb-button`), not as readable class names (`:global(.thumb-button)`).
// fluentCSSModuleOverrides.spec.ts checks these lists against the CSS.

// PartGroupingDecorator.module.css
const partGroupingDecoratorOverrides: readonly string[] = Object.freeze([]);

// SendBox.module.css
const sendBoxOverrides: readonly string[] = Object.freeze([]);

// Theme.module.css
const themeOverrides: readonly string[] = Object.freeze([]);

export { partGroupingDecoratorOverrides, sendBoxOverrides, themeOverrides };
