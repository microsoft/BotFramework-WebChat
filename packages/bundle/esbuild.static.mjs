/* eslint-disable no-magic-numbers */
/* eslint-disable arrow-body-style */
/* eslint-disable require-unicode-regexp */
/// <reference types="node" />

import * as esbuild from 'esbuild';
import { resolve as importMetaResolve } from 'import-meta-resolve';
import { dirname, join, resolve } from 'path';
import { readPackageUp } from 'read-pkg-up';
import { fileURLToPath, pathToFileURL } from 'url';

const umdResolvePlugin = {
  name: 'umd-resolve',
  setup(build) {
    // ESBuild use Go regular expressions and does not understand Unicode flag.
    // eslint-disable-next-line require-unicode-regexp
    build.onResolve({ filter: /^react$/ }, () => ({
      path: join(fileURLToPath(import.meta.url), '../../fluent-theme/src/external.umd/react.ts')
    }));

    build.onResolve({ filter: /^react-dom$/ }, () => ({
      path: join(fileURLToPath(import.meta.url), '../../fluent-theme/src/external.umd/react-dom.ts')
    }));

    // build.onResolve({ filter: /microsoft-cognitiveservices-speech-sdk/ }, () => ({
    //   path: resolve('../../node_modules/microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/Exports.js')
    // }));
  }
};

function extractName(entry) {
  const tokens = entry.split('/');
  const names = tokens.splice(0, entry.startsWith('@') ? 2 : 1);

  return [names.join('/'), tokens.join('/')];
}

/** @type { Map<string, import('esbuild').BuildOptions> } */
const configs = new Map();

/** @type { Map<string, string> } */
const importMap = new Map();

function flatName(name) {
  return name.replace(/\//gu, '.').replace(/^@/u, '');
}

// Some packages has `package.json` inside their /dist.
async function readPackageUpForReal(cwd) {
  const work = async function (cwd) {
    const result = await readPackageUp({ cwd });

    if (!result.packageJson.name) {
      return work(cwd.split('/').slice(0, -1).join('/'));
    }

    return result;
  };

  const result = await work(cwd);

  return result;
}

async function addConfig2(
  /** @type { import('esbuild').OnResolveArgs } */
  args
) {
  const result = fileURLToPath(importMetaResolve(args.path, pathToFileURL(args.resolveDir)));
  const { packageJson, path: packagePath } = await readPackageUpForReal(result);
  const { name, version } = packageJson;
  const fullName = `${name}@${version}`;

  let currentConfig = configs.get(fullName);

  if (!args.path.startsWith(name)) {
    throw new Error(`args.path must starts with name, args.path = ${args.path}, name = ${name}`);
  }

  const entryNames = `${flatName(name)}__${version}__[name]`;

  if (!currentConfig) {
    /** @type { import('esbuild').BuildOptions } */
    currentConfig = {
      absWorkingDir: dirname(packagePath),
      chunkNames: `${flatName(name)}__${version}__[name]-[hash]`,
      entryNames,
      entryPoints: {}
    };

    configs.set(fullName, currentConfig);
  }

  const entries = new Map(Object.entries(currentConfig.entryPoints));

  const [moduleName, namedExports] = extractName(args.path);

  if (!entries.has(args.path)) {
    // console.log('---', args.path, namedExports);
    entries.set(flatName(namedExports), args.path);
    currentConfig.entryPoints = Object.fromEntries(Array.from(entries.entries()));
    currentConfig.write = true;

    // console.log(name, currentConfig.entryPoints);
  }

  return `./${entryNames.replace(/\[name\]/g, flatName(namedExports || moduleName.split('/').at(-1)))}.js`
}

function getFirstConfig() {
  for (const value of configs.values()) {
    if (value.write !== false) {
      value.write = false;

      return value;
    }
  }
}

async function crawl() {
  const config = getFirstConfig();

  if (config) {
    await esbuild.build({
      ...config,
      bundle: true,
      format: 'esm',
      loader: { '.js': 'jsx' },
      minify: true,
      outdir: resolve(fileURLToPath(import.meta.url), `../static/`),
      platform: 'browser',
      sourcemap: false,
      splitting: true,
      write: true,
      /** @type { import('esbuild').Plugin[] } */
      plugins: [
        umdResolvePlugin,
        {
          name: 'static-builder',
          setup(build) {
            build.onResolve({ filter: /^[^.]/ }, async args => {
              if (args.path === 'mime') {
                return undefined;
              } else if (args.pluginData === 'npm') {
                return undefined;
              }

              if (args.kind === 'import-statement') {
                if (args.importer.includes('external.umd')) {
                  return undefined;
                }

                const path = await addConfig2(args);

                importMap.set(args.path, path);

                return { external: true, path };
              }

              return undefined;
            });
          }
        }
      ]
    });

    config.write = false;
  }
}

const CJS = [
  'adaptivecards@3.0.2',
  'base64-js@1.5.1',
  'botframework-directlinejs@0.15.6',
  'microsoft-cognitiveservices-speech-sdk',
  'react',
  'react-dom',
  'react-is@17.0.2'
];

(async () => {
  const {
    packageJson: { name }
  } = await readPackageUp({ cwd: process.argv[2] });

  configs.set(name, {
    chunkNames: `[name]-[hash]`,
    entryNames: `[name]`,
    entryPoints: [
      {
        in: process.argv[2],
        out: name
      }
    ]
  });

  for (const moduleId of CJS) {
    configs.set(moduleId, {
      chunkNames: `${flatName(moduleId.replace('@', '__'))}__[name]-[hash]`,
      entryNames: `${flatName(moduleId.replace('@', '__'))}__[name]`,
      entryPoints: {
        [`${moduleId.split('@')[0]}`]: `./external.umd/${moduleId}.ts`
      }
    });
  }

  console.log(resolve(fileURLToPath(import.meta.url), `../static/`));

  for (let i = 0; i < 10000; i++) {
    // eslint-disable-next-line no-await-in-loop
    await crawl();
  }

  // console.log(
  //   JSON.stringify(
  //     {
  //       imports: Object.fromEntries(Array.from(importMap.entries()).sort(([x], [y]) => (x > y ? 1 : x < y ? -1 : 0)))
  //     },
  //     null,
  //     2
  //   )
  // );
})();
