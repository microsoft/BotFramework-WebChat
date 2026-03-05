import * as esbuild from 'esbuild';

await esbuild.build({
  bundle: true,
  entryPoints: { 'oai-dl-adapter': './src/index.ts' },
  external: ['rxjs'],
  format: 'esm',
  outdir: './dist',
  platform: 'browser',
  sourcemap: true,
  target: 'es2020'
});

console.log('Build complete → dist/oai-dl-adapter.js');
