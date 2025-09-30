/// <reference types="node" />

/* eslint-env node */
/* eslint-disable no-console */
/* eslint-disable no-magic-numbers */
/* eslint-disable no-restricted-globals */

import { injectCSSPlugin } from '@msinternal/botframework-webchat-styles/build';
import { build, context } from 'esbuild';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { cssPlugin } from '../../esbuildPlugins.mjs';

// TODO: [P0] We cannot import TypeScript file here.
const fluentStyleContentPlaceholder = '@--FLUENT-STYLES-CONTENT--@';

function createWatcherPlugin(name) {
  /** @type { import('esbuild').Plugin } */
  return {
    name: 'watcher',
    setup(build) {
      let buildStart = Date.now();

      console.log([name, `Running in watch mode`].filter(Boolean).join(' '));

      build.onStart(() => {
        buildStart = Date.now();
        console.log([name, `Build start`].filter(Boolean).join(' '));
      });

      build.onEnd(() =>
        console.log([name, `⚡ Build success in ${Date.now() - buildStart}ms`].filter(Boolean).join(' '))
      );
    }
  };
}

/** @type { import('esbuild').BuildOptions } */
const config = {
  alias: {
    'html-react-parser': '@msinternal/html-react-parser'
  },
  bundle: true,
  chunkNames: `botframework-webchat-fluent-theme.[name]-[hash]`,
  entryNames: `[name]`,
  entryPoints: {
    'botframework-webchat-fluent-theme': './src/index.ts'
  },
  external: ['botframework-webchat*', 'react', 'react-dom'],
  format: 'esm',
  loader: { '.js': 'jsx' },
  minify: true,
  outdir: resolve(fileURLToPath(import.meta.url), `../static/`),
  platform: 'browser',
  plugins: [
    cssPlugin,
    injectCSSPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder }),
    {
      // `write` is set to `false`, we need to emit files ourselves.
      name: 'emit-output',
      setup(build) {
        build.onEnd(async args => {
          await Promise.all(
            args.outputFiles.map(async entry => {
              // eslint-disable-next-line security/detect-non-literal-fs-filename
              await mkdir(dirname(entry.path), { recursive: true });

              // eslint-disable-next-line security/detect-non-literal-fs-filename
              await writeFile(entry.path, entry.contents);
            })
          );
        });
      }
    }
  ],
  sourcemap: true,
  splitting: true,
  target: ['chrome100', 'firefox100', 'safari15'],
  // Set write to false for the `injectCSSPlugin` to work.
  // We will emit the output in another plugin.
  write: false
};

(async () => {
  const [_0, _1, watch] = process.argv;

  if (watch === '--watch') {
    config.plugins.push(createWatcherPlugin());

    await (await context(config)).watch({ delay: 200 });
  } else {
    await build(config);
  }
})();
