// TODO: Temporarily disable dark theme until all of Web Chat support dark theme.
// const DARK_THEME_SELECTOR = '@media (forced-colors: none) and (prefers-color-scheme: dark)';
// const LIGHT_THEME_SELECTOR = '@media (forced-colors: none) and (prefers-color-scheme: light)';
const DARK_THEME_SELECTOR = '@media (forced-colors: none) and not (forced-colors: none)'; // Always return false
const LIGHT_THEME_SELECTOR = '@media (forced-colors: none)';

const FORCED_COLORS_SELECTOR = '@media (forced-colors: active)';
const NOT_FORCED_COLORS_SELECTOR = '@media (forced-colors: none)';

export { DARK_THEME_SELECTOR, FORCED_COLORS_SELECTOR, LIGHT_THEME_SELECTOR, NOT_FORCED_COLORS_SELECTOR };
