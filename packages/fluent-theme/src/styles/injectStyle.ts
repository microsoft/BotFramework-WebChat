export const injectedStyles = '@--INJECTED-STYLES-CONTENT--@';

export default function injectStyles() {
  if (globalThis.document) {
    const style = document.createElement('style');
    style.append(document.createTextNode(injectedStyles));
    document.head.appendChild(style);
  }
}
