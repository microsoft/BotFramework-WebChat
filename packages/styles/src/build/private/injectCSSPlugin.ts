import { decode, encode } from '@jridgewell/sourcemap-codec';
import type { OutputFile, Plugin } from 'esbuild';

export interface InjectCSSPluginOptions {
  getCSSText?: ((source: OutputFile, cssFiles: OutputFile[]) => string | undefined | void) | undefined;
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

export default function injectCSSPlugin({ getCSSText, stylesPlaceholder }: InjectCSSPluginOptions): Plugin {
  if (!stylesPlaceholder) {
    throw new Error('inject-css-plugin: no placeholder for styles provided');
  }

  getCSSText =
    getCSSText ||
    ((source, cssFiles) => {
      const entryName = source.path.replace(/(\.js|\.mjs)$/u, '');
      const css = cssFiles.find(f => f.path.replace(/(\.css)$/u, '') === entryName);

      return css?.text;
    });

  const stylesPlaceholderQuoted = JSON.stringify(stylesPlaceholder);

  return {
    name: `inject-css-plugin(${stylesPlaceholder})`,
    setup(build) {
      build.onEnd(({ outputFiles = [] }) => {
        const cssFiles = outputFiles.filter(({ path }) => path.match(/(\.css)$/u));

        for (const file of outputFiles) {
          if (file.path.match(/(\.js|\.mjs)$/u)) {
            const text = getCSSText(file, cssFiles);
            const jsText = file?.text;

            if (text && jsText?.includes(stylesPlaceholderQuoted)) {
              const cssText = JSON.stringify(text);
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
