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
        }
      }
    }).setup({
      ...build,
      // eslint-disable-next-line require-unicode-regexp
      onLoad: (_filter, fn) => build.onLoad({ filter: /(\.module_built\.css|\?css_module)$/ }, fn)
    });
  }
};

export { cssPlugin };
