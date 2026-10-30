import { createRequire } from 'node:module';
import { defineConfig } from 'vite';

const { version: reactDOMVersion } = createRequire(import.meta.url)('react-dom/package.json');

export default defineConfig({
  build: {
    // Multi-page app: index.html, and element.html for Web Chat as a custom element.
    rollupOptions: { input: ['index.html', 'element.html'] }
  },
  define: {
    // The entry in index.html ("%VITE_ENTRY%", Vite's HTML constant replacement).
    'import.meta.env.VITE_ENTRY': JSON.stringify(
      reactDOMVersion.startsWith('16.') ? '/src/index.react16.js' : '/src/index.js'
    )
  }
});
