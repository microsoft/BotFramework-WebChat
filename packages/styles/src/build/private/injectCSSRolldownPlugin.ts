import path from 'node:path';
import type { Rolldown } from 'tsdown';

import { mapOutputsToRootOutputs, updateMappings, type InjectCSSPluginOptions, type Metafile } from './injectCSSPlugin';

// Rolldown flavor of injectCSSPlugin (esbuild), with the same options and logic. rolldown has no metafile: the same graph
// is built from `chunk.imports`. It expects `<entry>.css` in the bundle, emitted by cssPlugin (/rolldownPlugins.mjs).
export default function injectCSSRolldownPlugin({
  ignoreCSSEntries,
  stylesPlaceholder
}: InjectCSSPluginOptions): Rolldown.Plugin {
  if (!stylesPlaceholder) {
    throw new Error('inject-css-plugin: no placeholder for styles provided');
  }

  // Unlike esbuild, the rolldown (oxc) minifier prints strings as template literals: `@--STYLES--@`.
  const stylesPlaceholderQuotes = Object.freeze(['"', "'", '`'].map(quote => `${quote}${stylesPlaceholder}${quote}`));
  const ignoreCSSEntriesSet = new Set<string>(ignoreCSSEntries);

  return {
    name: `inject-css-plugin(${stylesPlaceholder})`,
    generateBundle: {
      // After cssPlugin emitted the CSS files.
      order: 'post',
      handler({ dir = 'dist' }, bundle) {
        // Same keys as esbuild's metafile (e.g. "dist/botframework-webchat-component.css"), for the same ignoreCSSEntries.
        const toKey = (fileName: string) =>
          path.posix.join(path.relative(process.cwd(), dir).replaceAll('\\', '/'), fileName);
        const chunks = Object.values(bundle).filter((file): file is Rolldown.OutputChunk => file.type === 'chunk');

        const metafile: Metafile = {
          outputs: Object.fromEntries(
            chunks.map(chunk => [
              toKey(chunk.fileName),
              {
                ...(chunk.isEntry && chunk.facadeModuleId ? { entryPoint: chunk.facadeModuleId } : {}),
                imports: chunk.imports.map(fileName => ({ path: toKey(fileName) }))
              }
            ])
          )
        };

        const { outputToRoots } = mapOutputsToRootOutputs(metafile);

        for (const chunk of chunks) {
          const jsText = chunk.code;
          const stylesPlaceholderQuoted = stylesPlaceholderQuotes.find(quoted => jsText.includes(quoted));

          if (!stylesPlaceholderQuoted) {
            continue;
          }

          const outKey = toKey(chunk.fileName);
          const cssFilesMap = new Map(
            (outputToRoots.get(outKey) || []).flatMap(owner => {
              const cssKey = owner.replace(/\.[cm]?js$/u, '.css');
              const cssFile = bundle[path.posix.relative(toKey(''), cssKey)];

              return cssFile?.type === 'asset' ? [[cssKey, cssFile] as const] : [];
            })
          );

          const cssCandidateKeys = new Set(cssFilesMap.keys()).difference(ignoreCSSEntriesSet);

          if (cssCandidateKeys.size !== 1) {
            throw new Error(
              `inject-css-plugin: unable to uniquely determine CSS for ${outKey}. Found CSS entries: \n[\n${[
                ...cssCandidateKeys
              ]
                .map(entry => `  '${entry}'`)
                .join(',\n')}\n]\n  Add the appropriate CSS file to ignoreCSSEntries to fix this issue.`
            );
          }

          const cssSource = cssFilesMap.get(Array.from(cssCandidateKeys).at(0)!)?.source;
          // Like esbuild's in-memory CSS output, without the source map comment.
          const cssText = (typeof cssSource === 'string' ? cssSource : new TextDecoder().decode(cssSource)).replace(
            /\/\*# sourceMappingURL=\S+ \*\/\n?$/u,
            ''
          );

          if (!cssText) {
            throw new Error(
              `inject-css-plugin: unable to find CSS text for ${outKey}.${ignoreCSSEntries ? '\n The following entries were ignored:\n' + ignoreCSSEntries.map(entry => `  '${entry}'`).join('\n') : ''}`
            );
          }

          const index = jsText.indexOf(stylesPlaceholderQuoted);
          const cssTextQuoted = JSON.stringify(cssText);
          const updatedJsText = [
            jsText.slice(0, index),
            cssTextQuoted,
            jsText.slice(index + stylesPlaceholderQuoted.length)
          ].join('');

          if (updatedJsText.includes(stylesPlaceholder)) {
            throw new Error(
              `Duplicate placeholders are not supported.\nFound ${stylesPlaceholder} in ${chunk.fileName}.`
            );
          }

          chunk.code = updatedJsText;

          const textBefore = jsText.slice(0, index);
          const shift = (mappings: string) =>
            updateMappings(
              mappings,
              textBefore.split('\n').length - 1,
              index - textBefore.lastIndexOf('\n') - 1,
              cssTextQuoted.length - stylesPlaceholderQuoted.length
            );

          // The map is in the bundle as an asset ("<chunk>.map") when written to a file, and on the chunk.
          const mapFile = bundle[chunk.sourcemapFileName ?? `${chunk.fileName}.map`];

          if (mapFile?.type === 'asset' && typeof mapFile.source === 'string') {
            const parsed = JSON.parse(mapFile.source);

            parsed.mappings = shift(parsed.mappings);
            mapFile.source = JSON.stringify(parsed);
          }

          if (chunk.map) {
            chunk.map.mappings = shift(chunk.map.mappings);
          }
        }
      }
    }
  };
}
