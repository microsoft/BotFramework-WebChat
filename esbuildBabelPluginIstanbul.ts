import { transformFileAsync } from '@babel/core';
import { OnLoadArgs, OnLoadOptions, OnLoadResult, Plugin } from 'esbuild';

export type Predicate = (args: OnLoadArgs) => boolean;

export type IstanbulPluginConfig = {
  filter: OnLoadOptions['filter'];
  loader: OnLoadResult['loader'];
  name: Plugin['name'];
  predicate?: Predicate | undefined;
};

export const defaultPredicate: Predicate = args => !args.path.includes('/node_modules/');

export const babelPlugin = ({ filter, loader, name, predicate = defaultPredicate }: IstanbulPluginConfig): Plugin => ({
  name,
  setup(build) {
    build.onLoad({ filter }, async args => {
      if (!predicate(args)) {
        return;
      }

      const result = await transformFileAsync(args.path, {
        plugins: ['babel-plugin-istanbul'],
        presets: ['@babel/preset-typescript', '@babel/preset-react'],
        rootMode: 'root',
        sourceFileName: args.path
      });

      if (!result?.code) {
        throw new Error(`Failed to add instrumentation code to ${args.path}.`);
      }

      return { contents: result.code, loader };
    });
  }
});
