import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const { version: reactDOMVersion } = createRequire(import.meta.url)('react-dom/package.json');

export default defineConfig({
  resolve: {
    // React 16 has no "react-dom/client".
    alias: reactDOMVersion.startsWith('16.')
      ? { 'react-dom/client': fileURLToPath(new URL('./src/react-dom-client.react16.js', import.meta.url)) }
      : {}
  }
});
