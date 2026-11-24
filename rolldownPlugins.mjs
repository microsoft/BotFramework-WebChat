// Rolldown flavor of esbuildBabelPluginIstanbul.ts, for tsdown.base.config.mts.
import { transformAsync } from '@babel/core';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Adds istanbul coverage counters to our sources (`NODE_ENV=test`), like esbuildBabelPluginIstanbul.ts.
 *
 * @returns {import('rolldown').Plugin}
 */
function istanbulPlugin() {
  return {
    name: 'webchat:babel-plugin-istanbul',
    transform: {
      filter: {
        id: {
          // Virtual modules (`\0…`) are skipped: an instrumented rolldown runtime ends up in the `.d.mts` chunks.
          exclude: [/^\0/u, /\/node_modules\//u, /\.worker\.[cm]?[jt]s$/u, /\.d\.[cm]?ts$/u],
          include: /\.[cm]?[jt]sx?$/u
        }
      },
      // Before rolldown removes types and JSX, like esbuild onLoad.
      order: 'pre',
      async handler(code, id) {
        const result = await transformAsync(code, {
          configFile: join(fileURLToPath(import.meta.url), '../esbuildBabelPluginIstanbul.babel.config.json'),
          filename: id,
          rootMode: 'root',
          sourceFileName: id,
          sourceMaps: true
        });

        if (!result?.code) {
          throw new Error(`Failed to add instrumentation code to ${id}.`);
        }

        // Babel already removed types and JSX (preset-typescript, preset-react).
        return { code: result.code, map: result.map, moduleType: 'js' };
      }
    }
  };
}

export { istanbulPlugin };
