/// <reference types="node" />

/* eslint-env node */
/* eslint-disable no-magic-numbers */
/* eslint-disable require-unicode-regexp */

import * as esbuild from 'esbuild';

(async () => {
  const context = await esbuild.context({
    alias: {
      'object-assign': '@msinternal/object-assign'
    },
    bundle: true,
    entryPoints: ['./src/index.ts'],
    format: 'esm',
    outdir: './dist/',
    platform: 'browser',
    splitting: true,
    sourcemap: true,

    /** @type { import('esbuild').Plugin[] } */
    plugins: [
      {
        name: 'react-resolver',
        setup(build) {
          build.onResolve({ filter: /^react$/ }, args =>
            args.kind === 'require-call' ? { path: 'react', namespace: 'stub' } : { external: true, path: args.path }
          );

          build.onLoad({ filter: /^react$/, namespace: 'stub' }, () => ({
            contents: "export * from 'react'; export { default } from 'react';"
          }));
        }
      }
    ]
  });

  if (process.argv[2] === '--watch') {
    await context.watch();
  } else {
    await context.build();
  }
})();
