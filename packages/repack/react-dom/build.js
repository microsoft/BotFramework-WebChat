/// <reference types="node" />

/* eslint-disable require-unicode-regexp */

import * as esbuild from 'esbuild';

esbuild.build({
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
