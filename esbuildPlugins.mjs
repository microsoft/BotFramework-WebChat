import lightningCssPlugin from 'unplugin-lightningcss/esbuild';

import { lightningCSSPluginOptions, removePreserveReason, sortClassMap } from './lightningCSSOptions.mjs';

// Due to a bug in unplugin, we cannot use the Lightning CSS unplugin directly.
// https://github.com/unjs/unplugin/issues/546
// To workaround the bug, we are converting it back to esbuild plugin so we can apply a custom `filter`.
// Otherwise, unplugin will apply `filter: /.*/` and trigger the bug down the road.

/** @type { import('esbuild').Plugin } */
const cssPlugin = {
  name: 'lightningcss',
  setup: build => {
    lightningCssPlugin(lightningCSSPluginOptions).setup({
      ...build,
      onLoad: (_filter, fn) =>
        // eslint-disable-next-line require-unicode-regexp
        build.onLoad({ filter: /(\.module_built\.css|\?css_module)$/ }, async args => {
          const result = await fn(args);

          // The CSS of a CSS module, or its JavaScript class map.
          return typeof result?.contents === 'string'
            ? {
                ...result,
                contents: args.path.endsWith('.module_built.css')
                  ? removePreserveReason(result.contents, args.path)
                  : sortClassMap(result.contents, args.path)
              }
            : result;
        })
    });
  }
};

export { cssPlugin };
