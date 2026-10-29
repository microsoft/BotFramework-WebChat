import { array, parse } from 'valibot';

import { cssModuleThemeSchema, type CSSModuleTheme } from './CSSModuleThemeContext';

const cssModulesSchema = array(cssModuleThemeSchema);

/**
 * Combines CSS module class maps into one map for `CSSModuleThemeContext`.
 *
 * Class names of the same local name are concatenated, never replaced, and appear once:
 * `combineCSSModules({ bubble: 'w1_bubble' }, { bubble: 'w2_bubble' })` returns `{ bubble: 'w1_bubble w2_bubble' }`.
 */
export default function combineCSSModules(...cssModules: readonly CSSModuleClasses[]): CSSModuleTheme {
  const classNamesMap = new Map<string, Set<string>>();

  for (const cssModule of parse(cssModulesSchema, cssModules)) {
    for (const [localName, classNames] of Object.entries(cssModule)) {
      const combinedClassNames = classNamesMap.get(localName) ?? new Set<string>();

      for (const className of classNames.split(/\s+/u)) {
        className && combinedClassNames.add(className);
      }

      combinedClassNames.size && classNamesMap.set(localName, combinedClassNames);
    }
  }

  return Object.freeze(
    Object.fromEntries(
      Array.from(classNamesMap, ([localName, classNames]) => [localName, Array.from(classNames).join(' ')])
    )
  );
}
