import { parse, string } from 'valibot';

/**
 * Picks the class names of the given local names from a CSS module, for `CSSModuleThemeComposer`.
 *
 * Throws if the CSS module does not define one of the local names.
 */
export default function pickCSSModule(
  cssModule: CSSModuleClasses,
  localNames: readonly string[]
): Readonly<Record<string, string>> {
  const classNamesMap = new Map(Object.entries(cssModule));

  return Object.freeze(
    Object.fromEntries(
      localNames.map(localName => [
        localName,
        parse(string(`The CSS module does not define the local name "${localName}".`), classNamesMap.get(localName))
      ])
    )
  );
}
