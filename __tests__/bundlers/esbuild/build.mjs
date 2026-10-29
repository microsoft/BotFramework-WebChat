// esbuild's build script (https://esbuild.github.io/getting-started/#build-scripts): the CLI cannot pick an alias by the installed React.

import * as esbuild from 'esbuild';
import { createRequire } from 'node:module';

const { version: reactDOMVersion } = createRequire(import.meta.url)('react-dom/package.json');

await esbuild.build({
  // React 16 has no "react-dom/client".
  alias: reactDOMVersion.startsWith('16.') ? { 'react-dom/client': './src/react-dom-client.react16.js' } : {},
  bundle: true,
  entryPoints: ['src/index.js'],
  minify: true,
  outfile: 'dist/main.js'
});
