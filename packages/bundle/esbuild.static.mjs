/// <reference types="node" />

/* eslint-env node */
/* eslint-disable no-magic-numbers */

import { build } from 'esbuild';
import { resolve as importMetaResolve } from 'import-meta-resolve';
import { dirname, resolve } from 'path';
import { readPackageUp } from 'read-pkg-up';
import { fileURLToPath, pathToFileURL } from 'url';

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

async function buildNextConfig() {
  const config = getPendingConfig();

  if (!config) {
    return;
  }

  await build({
    ...config,
    alias: {
      adaptivecards: '@msinternal/adaptivecards',
      'base64-js': '@msinternal/base64-js',
      'botframework-directlinejs': '@msinternal/botframework-directlinejs',
      'microsoft-cognitiveservices-speech-sdk': '@msinternal/microsoft-cognitiveservices-speech-sdk',
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
  });

  // HACK: We are using the "write" field to signal the config is completed.
  config.write = false;
}

(async () => {
  // eslint-disable-next-line prefer-destructuring
  const [_0, _1, input, output] = process.argv;

  configs.set('', {
    chunkNames: `[name]-[hash]`,
    entryNames: `[name]`,
    entryPoints: [{ in: input, out: output }]
  });

  // Prevent infinite-loop.
  for (let i = 0; i < 10000; i++) {
    // eslint-disable-next-line no-await-in-loop
    await buildNextConfig();
  }
})();
