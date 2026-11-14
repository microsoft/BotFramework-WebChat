// Rolldown plugins of tsdown.base.config.mts and the static builds (packages/*/rolldown.static.mjs).
import { transformAsync } from '@babel/core';
import { decode, encode } from '@jridgewell/sourcemap-codec';
import { Features, transform } from 'lightningcss';
import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
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
 * Concatenates the compiled CSS modules of an entry into one CSS file and one source map, like esbuild.
 *
 * @param {readonly { code: string; map: import('rolldown').SourceMapInput }[]} modules
 * @param {(source: string) => string} toSourcePath
 */
function concatCSS(modules, toSourcePath) {
  const mappings = [];
  const sources = [];
  const sourcesContent = [];

  for (const { code, map } of modules) {
    const sourceOffset = sources.length;

    sources.push(...map.sources.map(toSourcePath));
    sourcesContent.push(...(map.sourcesContent ?? map.sources.map(() => null)));

    // Every module starts on a new line: a module of N lines takes N lines of mappings.
    const lines = decode(map.mappings);
    const numLines = code.split('\n').length - 1;

    for (let index = 0; index < numLines; index++) {
      mappings.push(
        (lines[+index] || []).map(([column, source, originalLine, originalColumn]) =>
          typeof source === 'number' ? [column, source + sourceOffset, originalLine, originalColumn] : [column]
        )
      );
    }
  }

  return {
    code: modules.map(({ code }) => code).join(''),
    map: { mappings: encode(mappings), names: [], sources, sourcesContent, version: 3 }
  };
}

/**
 * Compiles CSS modules (`*.module.css`) with Lightning CSS and emits `<entry>.css` (and `.css.map`) for every entry with
 * CSS. esbuild bundles CSS itself; rolldown does not.
 *
 * The CSS of each module is lowered for `target` with Lightning CSS, as esbuild lowers the bundled CSS (e.g. CSS nesting for
 * safari15). Lightning CSS also adds the `-webkit-` prefixes that the targets need, a few more than esbuild does.
 *
 * The source map is rule-level: Lightning CSS maps each rule (selector) to its source, not each declaration.
 *
 * The plugin instance keeps the compiled CSS of the build: use one instance per build (tsdown.base.config.mts creates one
 * in the `build:before` hook, with the build's own `minify` and `target`).
 *
 * @param {{ minify: boolean; target: readonly string[] }} options
 * @returns {import('rolldown').Plugin[]}
 */
function cssPlugin({ minify, target }) {
  /** @type {Map<string, { code: string; map: import('rolldown').SourceMapInput }>} */
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
          // unplugin-lightningcss reads `*.module.css` itself: without this, `tsdown --watch` misses changes to it.
          this.addWatchFile(id.replace(CSS_MODULE_ID_PATTERN, '.module.css'));

          if (!BUILT_CSS_PATTERN.test(id)) {
            // No source map: the class map is generated code (its own source would be this code, with an absolute path).
            return { code: sortClassMap(code, id) };
          }

          const result = transform({
            code: Buffer.from(removePreserveReason(code, id)),
            exclude: EXCLUDED_FEATURES,
            filename: id,
            minify,
            sourceMap: true,
            targets
          });

          const css = result.code.toString();

          cssById.set(id, {
            code: css.endsWith('\n') ? css : `${css}\n`,
            // Lightning CSS writes the file name relative to its project root ("/"), keep the absolute one.
            map: { ...JSON.parse(result.map?.toString() ?? '{"mappings":"","version":3}'), sources: [id] }
          });

          // The CSS module becomes an empty JavaScript module (as with @tsdown/css), its CSS is in cssById.
          return { code: '', map: null, moduleSideEffects: 'no-treeshake', moduleType: 'js' };
        }
      },
      generateBundle({ dir = 'dist', sourcemap }, bundle) {
        for (const chunk of Object.values(bundle)) {
          if (chunk.type === 'chunk' && chunk.isEntry && chunk.facadeModuleId) {
            const modules = getEntryModuleIds(this, chunk.facadeModuleId).flatMap(id => cssById.get(id) ?? []);

            if (modules.length) {
              const fileName = chunk.fileName.replace(/\.[cm]?js$/u, '.css');
              const { code, map } = concatCSS(modules, source => relative(dir, source).replaceAll('\\', '/'));

              this.emitFile({
                fileName,
                source: sourcemap ? `${code}/*# sourceMappingURL=${fileName}.map */\n` : code,
                type: 'asset'
              });

              sourcemap && this.emitFile({ fileName: `${fileName}.map`, source: JSON.stringify(map), type: 'asset' });
            }
          }
        }
      }
    }
  ];
}

/**
 * Adds istanbul coverage counters to our sources (`NODE_ENV=test`).
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
          configFile: join(fileURLToPath(import.meta.url), '../babelPluginIstanbul.config.json'),
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

/**
 * Like esbuild: when a bundled file has a source map (e.g. our packages' `dist`), the output maps to its original sources.
 * rolldown does not read the `//# sourceMappingURL` of its inputs.
 */
function inputSourceMapPlugin() {
  return {
    name: 'webchat:input-source-map',
    load: {
      filter: { id: { exclude: /^\0/u, include: /\.[cm]?js$/u } },
      async handler(id) {
        const code = await readFile(id, 'utf8');
        const [, url] = /\n\/\/# sourceMappingURL=(\S+)\s*$/u.exec(code) || [];
        const mapPath = url && !url.startsWith('data:') && resolve(dirname(id), url);
        const map = mapPath && JSON.parse(await readFile(mapPath, 'utf8').catch(() => 'null'));

        return map
          ? {
              code,
              // Absolute paths, so rolldown writes them relative to the output like its own sources.
              map: {
                ...map,
                sourceRoot: undefined,
                sources: map.sources.map(source => resolve(dirname(mapPath), map.sourceRoot || '', source))
              }
            }
          : { code };
      }
    }
  };
}

export { cssPlugin, inputSourceMapPlugin, istanbulPlugin };
