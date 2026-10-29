// Bundles src/ like a consumer app would, with the installed bundler named on the command line, into dist/.
// Fails on errors, lists warnings.
//
// Usage: node build.mjs <esbuild | vite | webpack>

import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const [bundler] = process.argv.slice(2);
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const { version: bundlerVersion } = require(`${bundler}/package.json`);
const { version: reactVersion } = require('react/package.json');

// React 16 has no "react-dom/client".
const entry = reactVersion.startsWith('16.') ? 'src/index.react16.js' : 'src/index.js';

// Multi-line messages need "%0A" in GitHub Actions annotations.
const annotate = (command, message) => console.log(`::${command}::${message.replace(/\n/gu, '%0A')}`);

const html = script => `<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="utf-8" />
    <link href="data:," rel="icon" />
    <title>Web Chat bundled with ${bundler}</title>
  </head>
  <body>
    <main id="webchat" style="height: 100vh"></main>
    ${script}
  </body>
</html>
`;

// Production builds, like consumer apps ship, regardless of NODE_ENV (Vite would otherwise use it, e.g. "test").
// Development builds of React log warnings, which browser.mjs fails on.
const define = Object.freeze({ 'process.env.NODE_ENV': JSON.stringify('production') });

console.log(`Bundling ${entry} with ${bundler}@${bundlerVersion} and react@${reactVersion}.`);

if (bundler === 'esbuild') {
  const { build } = await import('esbuild');

  // Throws on errors, prints warnings.
  await build({
    bundle: true,
    define,
    entryPoints: [resolve(here, entry)],
    minify: true,
    outfile: resolve(here, 'dist/main.js')
  });
  await writeFile(resolve(here, 'dist/index.html'), html('<script src="main.js"></script>'));
} else if (bundler === 'vite') {
  const { build } = await import('vite');

  // Vite bundles from index.html. Throws on errors, prints warnings.
  await writeFile(resolve(here, 'index.html'), html(`<script src="/${entry}" type="module"></script>`));
  await build({ define, logLevel: 'warn', mode: 'production', root: here });
} else if (bundler === 'webpack') {
  const webpack = require('webpack');

  const stats = await new Promise((resolvePromise, reject) =>
    webpack(
      {
        entry: resolve(here, entry),
        mode: 'production',
        output: { filename: 'main.js', path: resolve(here, 'dist') },
        performance: { hints: false },
        ...(bundlerVersion.startsWith('4.') && require('./webpack4.config.js'))
      },
      (error, stats) => (error ? reject(error) : resolvePromise(stats))
    )
  );

  // webpack 4 reports strings, webpack 5 reports objects.
  const { errors, warnings } = stats.toJson({ all: false, errors: true, warnings: true });
  const toString = entry => (typeof entry === 'string' ? entry : `${entry.moduleName || ''}\n${entry.message}`);

  warnings.forEach(warning => annotate('warning', toString(warning)));
  errors.forEach(error => annotate('error', toString(error)));

  console.log(`${errors.length} error(s), ${warnings.length} warning(s).`);

  errors.length && process.exit(1);

  await mkdir(resolve(here, 'dist'), { recursive: true });
  await writeFile(resolve(here, 'dist/index.html'), html('<script src="main.js"></script>'));
} else {
  throw new Error(`Unknown bundler "${bundler}".`);
}

console.log('Bundled into dist/.');
