import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';
import { componentStyleContent as componentStyleContentPlaceholder } from './src/Styles/createStyles';
import { decoratorStyleContent as decoratorStyleContentPlaceholder } from './src/decorator/private/createStyles';

const createInjectCSSPlugin = (styleContentPlaceholder: string) => ({
  name: `inject-css-plugin${styleContentPlaceholder}`,
  setup(build) {
    build.onEnd(result => {
      for (const file of result.outputFiles) {
        if (file.path.match(/(\.js|\.mjs)$/u)) {
          const js = file;
          const entryName = js.path.replace(/(\.js|\.mjs)$/u, '');
          const css = result.outputFiles.find(f => f.path.replace(/(\.css)$/u, '') === entryName);
          if (css && js?.text.includes(styleContentPlaceholder)) {
            js.contents = Buffer.from(js.text.replace(`"${styleContentPlaceholder}"`, JSON.stringify(css.text)));
          }
        }
      }
    });
  }
});

export default defineConfig({
  ...baseConfig,
  loader: {
    ...baseConfig.loader,
    '.css': 'local-css'
  },
  esbuildPlugins: [
    createInjectCSSPlugin(componentStyleContentPlaceholder),
    createInjectCSSPlugin(decoratorStyleContentPlaceholder)
  ],
  entry: {
    'botframework-webchat-component': './src/index.ts',
    'botframework-webchat-component.internal': './src/internal.ts',
    'botframework-webchat-component.decorator': './src/decorator/index.ts'
  }
});
