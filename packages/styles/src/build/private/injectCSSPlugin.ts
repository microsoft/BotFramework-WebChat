import type { Plugin } from 'esbuild';
import { decode, encode } from '@jridgewell/sourcemap-codec';

export interface InjectCSSPluginOptions {
  stylesPlaceholder: string;
}

export default function injectCSSPlugin({ stylesPlaceholder }: InjectCSSPluginOptions): Plugin {
  if (!stylesPlaceholder) {
    throw new Error('inject-css-plugin: no placeholder for styles provided');
  }

  const stylesPlaceholderQuoted = JSON.stringify(stylesPlaceholder);

  return {
    name: `inject-css-plugin(${stylesPlaceholder})`,
    setup(build) {
      build.onEnd(({ outputFiles = [] }) => {
        for (const file of outputFiles) {
          if (file.path.match(/(\.js|\.mjs)$/u)) {
            const js = file;
            const entryName = js.path.replace(/(\.js|\.mjs)$/u, '');
            const css = outputFiles.find(f => f.path.replace(/(\.css)$/u, '') === entryName);
            const jsText = js?.text;
            if (css && jsText?.includes(stylesPlaceholderQuoted)) {
              const cssText = JSON.stringify(css.text);
              const index = jsText.indexOf(stylesPlaceholderQuoted);
              const map = outputFiles.find(f => f.path.replace(/(\.map)$/u, '') === js.path);

              const updatedJsText = [jsText.slice(0, index), cssText, jsText.slice(index + stylesPlaceholderQuoted.length)].join('');
              js.contents = Buffer.from(updatedJsText);

              if (updatedJsText.indexOf(stylesPlaceholder) !== -1) {
                throw new Error(`Duplicate placeholders are not supported.\nFound ${stylesPlaceholder} in ${js.path}.`)
              }

              if (map) {
                const parsed = JSON.parse(map.text);
                parsed.mappings = updateMappings(parsed.mappings, index, cssText.length - stylesPlaceholderQuoted.length);
                map.contents = Buffer.from(JSON.stringify(parsed));
              }
            }
          }
        }
      });
    }
  };
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
