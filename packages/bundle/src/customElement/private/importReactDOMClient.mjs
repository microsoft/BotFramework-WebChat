// "react-dom/client" (React 18 and later), or `undefined` when the import map does not have it (React 16 and 17).
// The static build (esbuild.static.mjs) uses this file instead of requireReactDOMClient.js.
export default import('react-dom/client').catch(() => undefined);
