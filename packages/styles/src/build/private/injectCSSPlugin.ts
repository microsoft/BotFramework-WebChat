import { decode, encode } from '@jridgewell/sourcemap-codec';
import type { Plugin } from 'esbuild';

export interface InjectCSSPluginOptions {
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
            const entryName = file.path.replace(/(\.js|\.mjs)$/u, '');
            const css = outputFiles.find(f => f.path.replace(/(\.css)$/u, '') === entryName);

            const jsText = file?.text;
            if (css && jsText?.includes(stylesPlaceholderQuoted)) {
              const cssText = JSON.stringify(css.text);
              const index = jsText.indexOf(stylesPlaceholderQuoted);
              const map = outputFiles.find(f => f.path.replace(/(\.map)$/u, '') === file.path);

              const updatedJsText = [
                jsText.slice(0, index),
                cssText,
                jsText.slice(index + stylesPlaceholderQuoted.length)
              ].join('');

              file.contents = Buffer.from(updatedJsText);

              // eslint-disable-next-line no-magic-numbers
              if (updatedJsText.indexOf(stylesPlaceholder) !== -1) {
                throw new Error(
                  `Duplicate placeholders are not supported.\nFound ${stylesPlaceholder} in ${file.path}.`
                );
              }

              if (map) {
                const parsed = JSON.parse(map.text);

                parsed.mappings = updateMappings(
                  parsed.mappings,
                  index,
                  cssText.length - stylesPlaceholderQuoted.length
                );

                map.contents = Buffer.from(JSON.stringify(parsed));
              }
            }
          }
        }
      });
    }
  };
}
