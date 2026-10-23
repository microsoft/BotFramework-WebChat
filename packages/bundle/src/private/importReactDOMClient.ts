/**
 * Imports "react-dom/client" on demand, only in the static build, where the import map of the page resolves it.
 *
 * Other builds cannot import it: bundlers fail to build for React 16 and 17, which do not have "react-dom/client".
 *
 * @returns A promise resolving to `undefined`, the static build replaces this file with `importReactDOMClient.static.ts`.
 */
export default function importReactDOMClient(): Promise<unknown> {
  return Promise.resolve(undefined);
}
