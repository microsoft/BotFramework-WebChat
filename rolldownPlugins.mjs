// Rolldown flavor of esbuildPlugins.mjs and esbuildBabelPluginIstanbul.ts, for tsdown.base.config.mts.
import { transformAsync } from '@babel/core';
import { Features, transform } from 'lightningcss';
import { Buffer } from 'node:buffer';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import lightningCssPlugin from 'unplugin-lightningcss/rolldown';

import { lightningCSSPluginOptions, removePreserveReason, sortClassMap } from './lightningCSSOptions.mjs';

const BUILT_CSS_PATTERN = /\.module_built\.css$/u;
const CSS_MODULE_ID_PATTERN = /(?:\.module\.css\?css_module|\.module_built\.css)$/u;
const TARGET_PATTERN = /^(chrome|edge|firefox|ios|opera|safari)(\d+)(?:\.(\d+))?$/u;

// esbuild keeps :dir()/:lang() and logical properties for our targets, Lightning CSS would rewrite them
// (e.g. :dir(rtl) becomes a list of :lang(), which breaks RTL set with the dir attribute).
const EXCLUDED_FEATURES = Features.DirSelector | Features.LangSelectorList | Features.LogicalProperties;

/**
 * Lightning CSS targets from esbuild/rolldown targets, e.g. ["chrome100", "safari15", "es2019"] (others are ignored).
 * Lightning CSS versions are `(major << 16) | (minor << 8)`.
 *
 * @param {readonly string[]} target
 * @returns {import('lightningcss').Targets}
 */
function toLightningCSSTargets(target) {
  return Object.fromEntries(
    target.flatMap(value => {
      const match = TARGET_PATTERN.exec(value);

      return match ? [[match[1] === 'ios' ? 'ios_saf' : match[1], (+match[2] << 16) | (+(match[3] || 0) << 8)]] : [];
    })
  );
}

/**
 * The CSS modules of an entry in esbuild's order: depth-first in import order, a module after the modules it imports.
 *
 * @param {import('rolldown').PluginContext} context
 * @param {string} entryId
 * @returns {string[]}
 */
function getEntryModuleIds(context, entryId) {
  const result = [];
  const visited = new Set();

  const visit = id => {
    if (!visited.has(id)) {
      visited.add(id);
      context.getModuleInfo(id)?.importedIds.forEach(visit);
      result.push(id);
    }
  };

  visit(entryId);

  return result;
}

/**
 * Compiles CSS modules (`*.module.css`) with Lightning CSS and emits `<entry>.css` for every entry with CSS, which
 * injectCSSRolldownPlugin injects into the entry's script. esbuild bundles CSS itself; rolldown does not.
 *
 * The CSS of each module is lowered for `target` with Lightning CSS, as esbuild lowers the bundled CSS (e.g. CSS nesting for
 * safari15). Lightning CSS also adds the `-webkit-` prefixes that the targets need, a few more than esbuild does.
 *
 * No CSS source map: the packages do not export `<entry>.css`, and the injected CSS has no source map.
 *
 * The plugin instance keeps the compiled CSS of the build: use one instance per build (tsdown.base.config.mts creates one
 * in the `build:before` hook, with the build's own `minify` and `target`).
 *
 * @param {{ minify: boolean; target: readonly string[] }} options
 * @returns {import('rolldown').Plugin[]}
 */
function cssPlugin({ minify, target }) {
  /** @type {Map<string, string>} */
  const cssById = new Map();
  const targets = toLightningCSSTargets(target);

  return [
    // Resolves `*.module.css` to `*.module.css?css_module` (class map, JavaScript) which imports `*.module_built.css` (CSS).
    lightningCssPlugin(lightningCSSPluginOptions),
    {
      name: 'webchat:css-modules',
      transform: {
        filter: { id: CSS_MODULE_ID_PATTERN },
        handler(code, id) {
          if (!BUILT_CSS_PATTERN.test(id)) {
            // Empty source map: the class map is generated code, without a source to map to. Without a map, rolldown warns.
            return { code: sortClassMap(code, id), map: { mappings: '' } };
          }

          const css = transform({
            code: Buffer.from(removePreserveReason(code, id)),
            exclude: EXCLUDED_FEATURES,
            filename: id,
            minify,
            targets
          }).code.toString();

          cssById.set(id, css.endsWith('\n') ? css : `${css}\n`);

          // The CSS module becomes an empty JavaScript module (as with @tsdown/css), its CSS is in cssById.
          return { code: '', map: null, moduleSideEffects: 'no-treeshake', moduleType: 'js' };
        }
      },
      generateBundle(_, bundle) {
        for (const chunk of Object.values(bundle)) {
          if (chunk.type === 'chunk' && chunk.isEntry && chunk.facadeModuleId) {
            const css = getEntryModuleIds(this, chunk.facadeModuleId)
              .map(id => cssById.get(id) ?? '')
              .join('');

            if (css) {
              this.emitFile({ fileName: chunk.fileName.replace(/\.[cm]?js$/u, '.css'), source: css, type: 'asset' });
            }
          }
        }
      }
    }
  ];
}

/**
 * Adds istanbul coverage counters to our sources (`NODE_ENV=test`), like esbuildBabelPluginIstanbul.ts.
 *
 * @returns {import('rolldown').Plugin}
 */
function istanbulPlugin() {
  return {
    name: 'webchat:babel-plugin-istanbul',
    transform: {
      filter: {
        id: {
          // Virtual modules (`\0…`) are skipped: an instrumented rolldown runtime ends up in the `.d.mts` chunks.
          exclude: [/^\0/u, /\/node_modules\//u, /\.worker\.[cm]?[jt]s$/u, /\.d\.[cm]?ts$/u],
          include: /\.[cm]?[jt]sx?$/u
        }
      },
      // Before rolldown removes types and JSX, like esbuild onLoad.
      order: 'pre',
      async handler(code, id) {
        const result = await transformAsync(code, {
          configFile: join(fileURLToPath(import.meta.url), '../esbuildBabelPluginIstanbul.babel.config.json'),
          filename: id,
          rootMode: 'root',
          sourceFileName: id,
          sourceMaps: true
        });

        if (!result?.code) {
          throw new Error(`Failed to add instrumentation code to ${id}.`);
        }

        // Babel already removed types and JSX (preset-typescript, preset-react).
        return { code: result.code, map: result.map, moduleType: 'js' };
      }
    }
  };
}

export { cssPlugin, istanbulPlugin };
