import { decode, encode } from '@jridgewell/sourcemap-codec';
import path from 'node:path';
import type { Rolldown } from 'tsdown';

export interface InjectCSSPluginOptions {
  ignoreCSSEntries?: string[];
  stylesPlaceholder: string;
}

// Shifts the generated columns after the placeholder on its line, by how much longer the embedded string is.
// Other lines do not move: JSON.stringify() escapes line breaks.
function updateMappings(encoded: string, line: number, column: number, offset: number) {
  const mappings = decode(encoded);

  for (const segment of mappings[+line] || []) {
    if (segment[0] > column) {
      segment[0] += offset;
    }
  }

  return encode(mappings);
}

type Metafile = {
  outputs: Record<
    string,
    {
      entryPoint?: string;
      imports?: Array<{ path: string; kind?: string; external?: boolean }>;
    }
  >;
};

function mapOutputsToRootOutputs(metafile: Metafile) {
  const outputs = metafile.outputs || {};
  const allFiles = new Set(Object.keys(outputs));

  const roots: string[] = [];
  const graph = new Map<string, string[]>();

  for (const [file, meta] of Object.entries(outputs)) {
    if (meta.entryPoint) {
      roots.push(file);
    }

    const edges: string[] = [];
    const imports = meta.imports || [];

    for (const imp of imports) {
      if (imp.external) {
        continue;
      }

      if (allFiles.has(imp.path)) {
        edges.push(imp.path);
      } else {
        const resolved = path.posix.normalize(path.posix.resolve(path.posix.dirname(file), imp.path));
        if (allFiles.has(resolved)) {
          edges.push(resolved);
        }
      }
    }
    graph.set(file, edges);
  }

  roots.sort();

  const outputToRoots = new Map<string, Set<string>>();

  for (const file of allFiles) {
    outputToRoots.set(file, new Set());
  }

  for (const root of roots) {
    const stack = [root];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const node = stack.pop()!;

      if (visited.has(node)) {
        continue;
      }
      visited.add(node);

      outputToRoots.get(node)?.add(root);

      const children = graph.get(node);
      if (children) {
        stack.push(...children);
      }
    }
  }

  const result = new Map<string, readonly string[]>();
  for (const [file, rootSet] of outputToRoots) {
    result.set(file, Object.freeze([...rootSet].sort()));
  }

  return { roots, outputToRoots: result };
}

// Embeds the CSS of an entry (`<entry>.css`, emitted by cssPlugin in /rolldownPlugins.mjs) into the string placeholder
// of its chunk. The entry that owns a chunk is found in an esbuild-like metafile built from `chunk.imports`.
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
