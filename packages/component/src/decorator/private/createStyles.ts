export const decoratorStyleContent = '@--DECORATOR-STYLES-CONTENT--@';

export default function createStyles() {
  if (!globalThis.document) {
    return [];
  }

  const style = document.createElement('style');
  style.append(document.createTextNode(decoratorStyleContent));
  return [style];
}
