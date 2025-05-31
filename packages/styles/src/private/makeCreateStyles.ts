function createStyle(content: string, origin?: string) {
  const style = document.createElement('style');

  style.append(document.createTextNode(content));

  if (origin) {
    style.dataset['webchatInjected'] = origin;
  }

  return style;
}

export default function makeCreateStyles(...contents: string[]) {
  return function createStyles(origin?: string) {
    if (!globalThis.document) {
      throw new Error('Unable to create styles: document is not defined');
    }

    return contents.map(content => createStyle(content, origin));
  };
}
