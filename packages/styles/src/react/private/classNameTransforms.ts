/**
 * Returns the readable class name to add next to the hashed class name of a CSS module local name,
 * or `undefined` to add none.
 */
type ClassNameTransform = (localName: string) => string | undefined;

/** Today's readable class name: the local name itself, e.g. `bubble`. */
function localClassName(localName: string): string {
  return localName;
}

/** Stable readable class name for legacy selectors, e.g. `webchat__bubble`. */
function webChatPrefixedClassName(localName: string): string {
  return `webchat__${localName}`;
}

export { localClassName, webChatPrefixedClassName, type ClassNameTransform };
