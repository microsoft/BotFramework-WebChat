function createStyle(content: string) {
  const style = document.createElement('style');
  style.append(document.createTextNode(content));
  return style;
}

export default function makeCreateStyles(...contents: string[]) {
  return function createStyles() {
    if (!globalThis.document) {
      return [];
    }

    return contents.map(content => createStyle(content));
  };
}
