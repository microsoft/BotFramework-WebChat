import { transformFileAsync } from '@babel/core';
import babelPluginIstanbul from 'babel-plugin-istanbul';
import { OnLoadArgs, OnLoadOptions, OnLoadResult, Plugin } from 'esbuild';

export type Predicate = (args: OnLoadArgs) => boolean;

export type IstanbulPluginConfig = {
  filter: OnLoadOptions['filter'];
  loader: OnLoadResult['loader'];
  name: Plugin['name'];
  predicate?: Predicate | undefined;
};

export const defaultPredicate: Predicate = args => !args.path.includes('/node_modules/');

export const plugin = ({
  filter,
  loader,
  name,
  predicate = defaultPredicate
}: IstanbulPluginConfig): Plugin => ({
  name,
  setup(build) {
    build.onLoad({ filter }, async args => {
      if (!predicate(args)) {
        return;
      }

      const result = await transformFileAsync(args.path, {
        plugins: [babelPluginIstanbul]
      });

      if (!result?.code) {
        throw new Error(`Failed to add instrumentation code to ${args.path}.`);
      }

      return { contents: result.code, loader };
    });
  }
});
