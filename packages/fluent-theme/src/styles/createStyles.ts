export const injectedStyles = '@--INJECTED-STYLES-CONTENT--@';

export default function createStyles() {
  if (!globalThis.document) {
    return [];
  }

  const style = document.createElement('style');
  style.append(document.createTextNode(injectedStyles));
  return [style];
}
