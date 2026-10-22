/**
 * Imports "react-dom/client" through the import map of the page.
 *
 * Replaces `importReactDOMClient.ts` in the static build.
 */
export default function importReactDOMClient(): Promise<unknown> {
  // @ts-expect-error The types of React DOM 16 do not have "react-dom/client".
  return import('react-dom/client');
}
