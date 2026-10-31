import { Buffer } from 'buffer';
import { transform } from 'lightningcss';
import { fileURLToPath } from 'url';
import lightningCssPlugin from 'unplugin-lightningcss/esbuild';

// A CSS module rule without styles of its own keeps its class name (e.g. for themes) with this declaration:
// Lightning CSS drops empty rules, and their class names with them.
// Once the class map is built, the declaration, and the rule if it becomes empty, are removed from the CSS.
const PRESERVE_REASON_PROPERTY = '--webchat-preserve-reason';

const removePreserveReasonVisitor = Object.freeze({
  Declaration: Object.freeze({ custom: Object.freeze({ [PRESERVE_REASON_PROPERTY]: () => [] }) })
});

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
      onLoad: (_filter, fn) =>
        // eslint-disable-next-line require-unicode-regexp
        build.onLoad({ filter: /(\.module_built\.css|\?css_module)$/ }, async args => {
          const result = await fn(args);

          return typeof result?.contents === 'string' && result.contents.includes(PRESERVE_REASON_PROPERTY)
            ? {
                ...result,
                contents: transform({
                  code: Buffer.from(result.contents),
                  filename: args.path,
                  visitor: removePreserveReasonVisitor
                }).code.toString()
              }
            : result;
        })
    });
  }
};

export { cssPlugin };
