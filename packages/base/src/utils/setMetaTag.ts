/// <reference lib="dom" />

// Courtesy of https://stackoverflow.com/a/67243723.
function kebabCase(value: string): string {
  return value.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? '-' : '') + $.toLowerCase());
}

export default function setMetaTag(name: string, content: string): void;
export default function setMetaTag(name: string, contentMap: ReadonlyMap<string, string | undefined>): void;

export default function setMetaTag(name: string, contentMap: ReadonlyMap<string, string | undefined> | string): void {
  try {
    const { document } = globalThis;

    if (typeof document !== 'undefined' && document.createElement && document.head && document.head.appendChild) {
      const meta = document.querySelector(`html meta[name="${encodeURI(name)}"]`) || document.createElement('meta');

      meta.setAttribute('name', name);
      meta.setAttribute(
        'content',
        typeof contentMap === 'string'
          ? contentMap
          : Array.from(contentMap.entries())
              .map(([key, value]) => {
                const name = kebabCase(encodeURIComponent(key));

                return typeof value === 'undefined' ? name : `${name}=${encodeURIComponent(value)}`;
              })
              .join('; ')
      );

      document.head.appendChild(meta);
    }
  } catch {
    // Intentionally left blank.
  }
}
