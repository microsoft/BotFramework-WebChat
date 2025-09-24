/// <reference types="node" />

/* eslint-env node */
/* eslint-disable no-console */
/* eslint-disable no-magic-numbers */
/* eslint-disable no-restricted-globals */

import { build, context } from 'esbuild';
import { resolve as importMetaResolve } from 'import-meta-resolve';
import { dirname, resolve } from 'path';
import { readPackageUp } from 'read-pkg-up';
import { fileURLToPath, pathToFileURL } from 'url';

const isomorphicReactPlugin = {
  name: 'isomorphic-react',
  setup(build) {
    // eslint-disable-next-line require-unicode-regexp
    build.onResolve({ filter: /^(react|react-dom)$/, namespace: 'file' }, ({ path }) => ({
      namespace: 'isomorphic-react',
      path
    }));

    // eslint-disable-next-line require-unicode-regexp
    build.onLoad({ filter: /^react$/, namespace: 'isomorphic-react' }, () => ({
      contents: "import React from 'react'; module.exports = globalThis.React || React;"
    }));

    // eslint-disable-next-line require-unicode-regexp
    build.onLoad({ filter: /^react-dom$/, namespace: 'isomorphic-react' }, () => ({
      contents: "import ReactDOM from 'react-dom'; module.exports = globalThis.ReactDOM || ReactDOM;"
    }));
  }
};

function createWatcherPlugin(name) {
  /** @type { import('esbuild').Plugin } */
  return {
    name: 'watcher',
    setup(build) {
      let buildStart = Date.now();

      console.log(`${name} Running in watch mode`);

      build.onStart(() => {
        buildStart = Date.now();
        console.log(`${name} Build start`);
      });

      build.onEnd(() => console.log(`${name} ⚡ Build success in ${Date.now() - buildStart}ms`));
    }
  };
}

/**
 * Extracts the package name and the named exports path from an entry string.
 *
 * @param {string} entry - The entry string, typically a module path.
 *                         If the entry starts with '@', it is treated as a scoped package.
 * @returns {[string, string]} - A tuple where the first element is the package name
 *                               and the second element is the remaining path (named exports).
 */
function extractPackageNameAndNamedExports(entry) {
  const tokens = entry.split('/');
  const names = tokens.splice(0, entry.startsWith('@') ? 2 : 1);

  return [names.join('/'), tokens.join('/')];
}

/** @type { Map<string, import('esbuild').BuildOptions> } */
const configs = new Map();

function flatName(name) {
  return name.replace(/\//gu, '.').replace(/^@/u, '');
}

// Some packages has `package.json` inside their /dist for specifying CJS/ESM, they are not the publishing package.json.
function readPublishingPackageJSONUp(cwd) {
  const work = async cwd => {
    const result = await readPackageUp({ cwd });

    return result.packageJson.name ? result : work(dirname(cwd));
  };

  return work(cwd);
}

async function addConfig(
  /** @type { import('esbuild').OnResolveArgs } */
  { path, resolveDir }
) {
  const importPathURL = importMetaResolve(path, pathToFileURL(resolveDir) + '/');

  if (!importPathURL.startsWith('file:')) {
    return;
  }

  const {
    packageJson: { name, version },
    path: packagePath
  } = await readPublishingPackageJSONUp(fileURLToPath(importPathURL));

  const fullName = `${name}@${version}`;

  if (!path.startsWith(name)) {
    throw new Error(`args.path must starts with name, args.path = ${path}, name = ${name}`);
  }

  const familyName = `${flatName(name)}__${version}`;
  const entryNames = `${familyName}__[name]`;

  let currentConfig = configs.get(fullName);

  if (!currentConfig) {
    /** @type { import('esbuild').BuildOptions } */
    currentConfig = {
      absWorkingDir: dirname(packagePath),
      chunkNames: `${familyName}__[name]-[hash]`,
      entryNames,
      entryPoints: {}
    };

    configs.set(fullName, currentConfig);
  }

  const entries = new Map(Object.entries(currentConfig.entryPoints));

  const [moduleName, namedExports] = extractPackageNameAndNamedExports(path);
  const entryName = flatName(namedExports || moduleName.split('/').at(-1));

  if (!entries.has(entryName)) {
    entries.set(entryName, path);

    currentConfig.entryPoints = Object.fromEntries(Array.from(entries.entries()));
    currentConfig.write = true;
  }

  return `./${entryNames.replace(/\[name\]/gu, entryName)}.js`;
}

function getPendingConfig() {
  for (const value of configs.values()) {
    if (value.write !== false) {
      return value;
    }
  }
}

const BASE_CONFIG = {
  alias: {
    adaptivecards: '@msinternal/adaptivecards',
    'base64-js': '@msinternal/base64-js',
    'botframework-directlinejs': '@msinternal/botframework-directlinejs',
    'microsoft-cognitiveservices-speech-sdk': '@msinternal/microsoft-cognitiveservices-speech-sdk',
    'object-assign': '@msinternal/object-assign',
    react: '@msinternal/react',
    'react-dom': '@msinternal/react-dom',
    'react-is': '@msinternal/react-is'
  },
  bundle: true,
  format: 'esm',
  loader: { '.js': 'jsx' },
  minify: true,
  outdir: resolve(fileURLToPath(import.meta.url), `../static/`),
  platform: 'browser',
  sourcemap: true,
  splitting: true,
  write: true,

  /** @type { import('esbuild').Plugin[] } */
  plugins: [
    isomorphicReactPlugin,
    {
      name: 'static-builder',
      setup(build) {
        // eslint-disable-next-line require-unicode-regexp
        build.onResolve({ filter: /^[^.]/ }, async args => {
          // Only ESM can be externalized, CJS cannot be externalized because require() is not guaranteed to be at top-level.
          if (args.kind === 'import-statement') {
            const path = await addConfig(args);

            return path ? { external: true, path } : undefined;
          }

          return undefined;
        });
      }
    }
  ]
};

async function buildNextConfig() {
  const config = getPendingConfig();

  if (!config) {
    return;
  }

  await build({
    ...config,
    ...BASE_CONFIG
  });

  // HACK: We are using the "write" field to signal the config is completed.
  config.write = false;
}

(async () => {
  // eslint-disable-next-line prefer-destructuring
  const [_0, _1, watch] = process.argv;

  configs.set('botframework-webchat', {
    chunkNames: `botframework-webchat.[name]-[hash]`,
    entryNames: `[name]`,
    entryPoints: {
      'botframework-webchat': './src/boot/exports/index.ts',
      'botframework-webchat.component': './src/boot/exports/component.ts',
      'botframework-webchat.decorator': './src/boot/exports/decorator.ts',
      'botframework-webchat.hook': './src/boot/exports/hook.ts',
      'botframework-webchat.internal': './src/boot/exports/internal.ts',
      'botframework-webchat.middleware': './src/boot/exports/middleware.ts'
    }
  });

  // Prevent infinite-loop.
  for (let i = 0; i < 10000; i++) {
    // eslint-disable-next-line no-await-in-loop
    await buildNextConfig();
  }

  if (watch === '--watch') {
    const ourConfigs = [];

    for (const [key, config] of configs) {
      if (key.startsWith('botframework-webchat')) {
        const ourConfig = { ...config, ...BASE_CONFIG };

        ourConfig.plugins.push(createWatcherPlugin(key));

        ourConfigs.push(ourConfig);
      }
    }

    await Promise.all(ourConfigs.map(async config => (await context(config)).watch()));
  }
})();
