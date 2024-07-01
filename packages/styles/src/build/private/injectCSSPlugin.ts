import type { Plugin } from 'esbuild';

export interface InjectCSSPluginOptions {
  stylesPlaceholder: string;
}

export default function injectCSSPlugin({ stylesPlaceholder }: InjectCSSPluginOptions): Plugin {
  if (!stylesPlaceholder) {
    throw new Error('inject-css-plugin: no placeholder for styles provided');
  }
  return {
    name: `inject-css-plugin(${stylesPlaceholder})`,
    setup(build) {
      build.onEnd(({ outputFiles = [] }) => {
        for (const file of outputFiles) {
          if (file.path.match(/(\.js|\.mjs)$/u)) {
            const js = file;
            const entryName = js.path.replace(/(\.js|\.mjs)$/u, '');
            const css = outputFiles.find(f => f.path.replace(/(\.css)$/u, '') === entryName);
            if (css && js?.text.includes(stylesPlaceholder)) {
              js.contents = Buffer.from(js.text.replace(`"${stylesPlaceholder}"`, JSON.stringify(css.text)));
            }
          }
        }
      });
    }
  };
}
