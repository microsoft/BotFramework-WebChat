import { fileURLToPath } from 'url';
import lightningCssPlugin from 'unplugin-lightningcss/esbuild';

// Due to a bug in unplugin, we cannot use the Lightning CSS unplugin directly.
// https://github.com/unjs/unplugin/issues/546
// To workaround the bug, we are converting it back to esbuild plugin so we can apply a custom `filter`.
// Otherwise, unplugin will apply `filter: /.*/` and trigger the bug down the road.

/** @type { import('esbuild').Plugin } */
const cssPlugin = {
  name: 'lightningcss',
  setup: build => {
    lightningCssPlugin({
      include: [/\.module\.css$/u],
      options: {
        cssModules: {
          pattern: 'w[hash]_[local]',
          pure: true,
          animation: false,
          grid: false,
          customIdents: false
        },
        // Hashed class names come from the file path relative to this folder (the repository root):
        // the same on every machine, and different for modules at the same path in different packages.
        projectRoot: fileURLToPath(new URL('.', import.meta.url))
      }
    }).setup({
      ...build,
      // eslint-disable-next-line require-unicode-regexp
      onLoad: (_filter, fn) => build.onLoad({ filter: /(\.module_built\.css|\?css_module)$/ }, fn)
    });
  }
};

export { cssPlugin };
