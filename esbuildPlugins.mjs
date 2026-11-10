import lightningCssPlugin from 'unplugin-lightningcss/esbuild';

import { lightningCSSPluginOptions, PRESERVE_REASON_PROPERTY, removePreserveReason } from './lightningCSSOptions.mjs';

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

          // Only the CSS of a CSS module, not its JavaScript class map, and only if it has the declaration.
          return args.path.endsWith('.module_built.css') &&
            typeof result?.contents === 'string' &&
            result.contents.includes(PRESERVE_REASON_PROPERTY)
            ? { ...result, contents: removePreserveReason(result.contents, args.path) }
            : result;
        })
    });
  }
};

export { cssPlugin };
