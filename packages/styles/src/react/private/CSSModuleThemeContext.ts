import { createContext } from 'react';
import { pipe, readonly, record, string, type InferOutput } from 'valibot';

const cssModuleThemeSchema = pipe(record(string(), string()), readonly());

/**
 * Extra class names for CSS module local names, e.g. `{ bubble: 'w1abc_bubble w2def_bubble' }`.
 *
 * `useStyles()` adds the classes for a local name to the element that uses the same local name.
 */
type CSSModuleTheme = InferOutput<typeof cssModuleThemeSchema>;

// Internal: themes provide it via <CSSModuleThemeComposer>, components read it via useStyles(); not a public API.
const CSSModuleThemeContext = createContext<CSSModuleTheme>(Object.freeze({}));

CSSModuleThemeContext.displayName = 'WebChat.CSSModuleThemeContext';

export default CSSModuleThemeContext;
export { cssModuleThemeSchema, type CSSModuleTheme };
