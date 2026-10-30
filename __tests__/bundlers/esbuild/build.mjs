// esbuild's build script (https://esbuild.github.io/getting-started/#build-scripts): the CLI cannot pick the entry by the installed React.

import * as esbuild from 'esbuild';
import { createRequire } from 'node:module';

const { version: reactDOMVersion } = createRequire(import.meta.url)('react-dom/package.json');

await esbuild.build({
  bundle: true,
  entryPoints: {
    element: 'src/element.js',
    main: reactDOMVersion.startsWith('16.') ? 'src/index.react16.js' : 'src/index.js'
  },
  minify: true,
  outdir: 'dist'
});
