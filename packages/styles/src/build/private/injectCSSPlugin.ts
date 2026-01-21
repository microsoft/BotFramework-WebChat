import { decode, encode } from '@jridgewell/sourcemap-codec';
import path from 'node:path';
import type { OutputFile, Plugin } from 'esbuild';

export interface InjectCSSPluginOptions {
  ignoreCSSEntries?: string[];
  stylesPlaceholder: string;
}

function updateMappings(encoded: string, startIndex: number, offset: number) {
  const mappings = decode(encoded);

  for (const mapping of mappings) {
    for (const line of mapping) {
      if (line[0] > startIndex) {
        line[0] += offset;
      }
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

export function mapOutputsToRootOutputs(metafile: Metafile) {
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

function findOutputKeyForFile(filePath: string, outputToRoots: Map<string, readonly string[]>): string | undefined {
  const fp = path.normalize(filePath);

  // output keys in esbuild metafile are relative e.g. "dist/chunk-XYZ.js"
  for (const outKey of outputToRoots.keys()) {
    const k1 = path.normalize(outKey); // "dist/chunk-XYZ.js"
    const k2 = path.normalize(path.join(path.sep, outKey)); // "/dist/chunk-XYZ.js"
    if (fp.endsWith(k1) || fp.endsWith(k2)) {
      return outKey;
    }
  }

  return undefined;
}

function diffSets<K>(self: Set<K>, other: Set<K>): Set<K> {
  const result = new Set<K>();
  for (const element of self) {
    if (!other.has(element)) {
      result.add(element);
    }
  }
  return result;
}

export default function injectCSSPlugin({ ignoreCSSEntries, stylesPlaceholder }: InjectCSSPluginOptions): Plugin {
  if (!stylesPlaceholder) {
    throw new Error('inject-css-plugin: no placeholder for styles provided');
  }

  const stylesPlaceholderQuoted = JSON.stringify(stylesPlaceholder);

  const ignoreCSSEntriesSet = new Set<string>(ignoreCSSEntries);

  return {
    name: `inject-css-plugin(${stylesPlaceholder})`,
    setup(build) {
      if (build.initialOptions.metafile) {
        build.initialOptions.metafile = true;
      }

      build.onEnd(({ outputFiles = [], metafile }) => {
        const cssFiles = outputFiles.filter(({ path }) => path.match(/(\.css)$/u));
        const jsFiles = outputFiles.filter(({ path }) => path.match(/(\.js|\.mjs)$/u));

        const jsToCssMap = new Map(
          cssFiles
            .map(cssFile => {
              const jsFilePath = jsFiles.find(
                jsFile => jsFile.path.replace(/(\.js|\.mjs)$/u, '') === cssFile.path.replace(/(\.css)$/u, '')
              )?.path;
              if (!jsFilePath) {
                return;
              }
              return [jsFilePath, cssFile] as const;
            })
            .filter((entry): entry is readonly [string, OutputFile] => entry !== undefined)
        );

        if (!metafile) {
          throw new Error('inject-css-plugin: metafile is required for proper CSS injection');
        }

        const { outputToRoots } = mapOutputsToRootOutputs(metafile);

        for (const file of outputFiles) {
          if (file.path.match(/(\.js|\.mjs)$/u)) {
            const jsText = file?.text;

            const shouldProccess = jsText?.includes(stylesPlaceholderQuoted);

            if (!shouldProccess) {
              continue;
            }

            const outKey = findOutputKeyForFile(file.path, outputToRoots);
            const owners = (outKey && outputToRoots.get(outKey)) || [];
            const cssFilesMap = new Map(
              owners
                ?.map(owner => {
                  const cssFile = jsToCssMap.get(path.join(process.cwd(), owner));
                  if (!cssFile) {
                    return;
                  }
                  const cssKey = cssFile ? path.relative(process.cwd(), cssFile.path) : undefined;
                  return [cssKey, cssFile] as const;
                })
                .filter((entry): entry is readonly [string, OutputFile] => entry !== undefined)
            );

            const cssCandidateKeys = diffSets(new Set(cssFilesMap.keys()), ignoreCSSEntriesSet);

            if (cssCandidateKeys.size !== 1) {
              throw new Error(
                `inject-css-plugin: unable to uniquely determine CSS for ${outKey}. Found CSS entries: \n[\n${[
                  ...cssCandidateKeys
                ]
                  .map(entry => `  '${entry}'`)
                  .join(',\n')}\n]\n  Add the appropriate CSS file to ignoreCSSEntries to fix this issue.`
              );
            }

            const cssText = cssFilesMap.get(Array.from(cssCandidateKeys).at(0)!)?.text;

            if (!cssText) {
              throw new Error(
                `inject-css-plugin: unable to find CSS text for ${outKey}.${ignoreCSSEntries ? '\n The following entries were ignored:\n' + ignoreCSSEntries.map(entry => `  '${entry}'`).join('\n') : ''}`
              );
            }

            const index = jsText.indexOf(stylesPlaceholderQuoted);
            const map = outputFiles.find(f => f.path.replace(/(\.map)$/u, '') === file.path);

            const updatedJsText = [
              jsText.slice(0, index),
              JSON.stringify(cssText),
              jsText.slice(index + stylesPlaceholderQuoted.length)
            ].join('');

            file.contents = Buffer.from(updatedJsText);

            // eslint-disable-next-line no-magic-numbers
            if (updatedJsText.indexOf(stylesPlaceholder) !== -1) {
              throw new Error(`Duplicate placeholders are not supported.\nFound ${stylesPlaceholder} in ${file.path}.`);
            }

            if (map) {
              const parsed = JSON.parse(map.text);

              parsed.mappings = updateMappings(parsed.mappings, index, cssText.length - stylesPlaceholderQuoted.length);

              map.contents = Buffer.from(JSON.stringify(parsed));
            }
          }
        }
      });
    }
  };
}
