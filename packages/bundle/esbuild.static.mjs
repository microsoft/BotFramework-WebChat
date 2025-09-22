/* eslint-disable no-magic-numbers */
/* eslint-disable arrow-body-style */
/* eslint-disable require-unicode-regexp */
/// <reference types="node" />

import * as esbuild from 'esbuild';
import { resolve as importMetaResolve } from 'import-meta-resolve';
import { dirname, join, resolve } from 'path';
import { getPackageEntryPoints } from 'pkg-entry-points';
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

// /** @type { (exports: any) => Generator<[string, string]> } */
// function* walkExports(exports) {
//   let name;

//   for (const [key, value1] of Object.entries(exports)) {
//     if (key.startsWith('.')) {
//       name = key.slice(2);

//       for (const [key, value2] of Object.entries(value1)) {
//         if (key === 'import') {
//           if (typeof value2 === 'string') {
//             yield [name, value2];
//           } else {
//             for (const [key, value3] of Object.entries(value2)) {
//               if (key === 'default') {
//                 yield [name, value3];
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// }

function extractName(entry) {
  const tokens = entry.split('/');
  const names = tokens.splice(0, entry.startsWith('@') ? 2 : 1);

  return [names.join('/'), tokens.join('/')];
}

/** @type { Map<string, import('esbuild').BuildOptions> } */
const configs = new Map();
/** @type { Set<string> } */
const doneConfigs = new Set();

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

// async function addConfig(cwd, entry) {
//   const result = fileURLToPath(importMetaResolve(entry, pathToFileURL(cwd)));
//   // const { packageJson, path: packagePath } = await readPackageUp({ cwd: result });
//   const { packageJson, path: packagePath } = await readPackageUpForReal(result);
//   const { name } = packageJson;

//   const packageExports = await getPackageEntryPoints(dirname(packagePath));

//   // console.log('addConfig', packagePath);

//   if (configs.has(name) || doneConfigs.has(name)) {
//     return;
//   }

//   /** @type { import('esbuild').BuildOptions } */
//   const baseConfig = {
//     chunkNames: `${flatName(name)}.[name].chunk-[hash]`,
//     entryNames: `${flatName(name)}.[name]`
//   };

//   const exports = [];

//   console.log(name, packageExports);

//   for (const [key, value] of Object.entries(packageExports)) {
//     exports.push(key.slice(2));
//   }

//   const config = {
//     ...baseConfig,
//     absWorkingDir: dirname(packagePath),
//     entryPoints: exports.map(key => {
//       const keyPrefixSlash = key && `/${key}`;

//       return {
//         // in: `npm:${name}${keyPrefixSlash}`,
//         in: `${name}${keyPrefixSlash}`,
//         out: `${name}${keyPrefixSlash}`
//       };
//     })
//   };

//   configs.set(name, config);

//   // if (!packageJson.exports) {
//   //   configs.set(name, {
//   //     ...baseConfig,
//   //     entryPoints: [
//   //       {
//   //         // in: `npm:${name}`,
//   //         in: name,
//   //         out: `${flatName(name)}`
//   //       }
//   //     ]
//   //   });
//   // } else {
//   //   if (name.includes('classname')) {
//   //     console.log(packageJson.exports);
//   //   }

//   //   let exports = Array.from(walkExports(packageJson.exports));
//   //   let exports2 = [];

//   //   if (name === 'html-react-parser') {
//   //     console.log(packagePath);
//   //     console.log(exports);

//   //     for (const [key, value] of exports) {
//   //       if (key.endsWith('/*')) {
//   //         const matches = await promisify(glob)(value, { cwd: dirname(packagePath) });

//   //         // Hacking for now.
//   //         for (const match of matches) {
//   //           exports2.push([match.replace('esm/', 'lib/').replace('.mjs', ''), `./${match}`]);
//   //         }
//   //       } else {
//   //         exports2.push([key, value]);
//   //       }
//   //     }

//   //     exports = exports2;

//   //     console.log(exports);
//   //     console.log(exports2);
//   //   }

//   //   const config = {
//   //     ...baseConfig,
//   //     absWorkingDir: dirname(packagePath),
//   //     entryPoints: exports.map(([key, value]) => {
//   //       const keyPrefixSlash = key && `/${key}`;

//   //       return {
//   //         // in: `npm:${name}${keyPrefixSlash}`,
//   //         in: `${name}${keyPrefixSlash}`,
//   //         out: `${name}${keyPrefixSlash}`
//   //       };
//   //     })
//   //   };

//   //   if (name.includes('classname')) {
//   //     console.log(config);
//   //   }

//   //   configs.set(name, config);
//   // }
// }

async function addConfig2(
  /** @type { import('esbuild').OnResolveArgs } */
  args
) {
  const result = fileURLToPath(importMetaResolve(args.path, pathToFileURL(args.resolveDir)));
  // const { packageJson, path: packagePath } = await readPackageUp({ cwd: result });
  const { packageJson, path: packagePath } = await readPackageUpForReal(result);
  const { name } = packageJson;

  let currentConfig = configs.get(name);

  if (!args.path.startsWith(name)) {
    throw new Error(`args.path must starts with name, args.path = ${args.path}, name = ${name}`);
  }

  if (!currentConfig) {
    /** @type { import('esbuild').BuildOptions } */
    currentConfig = {
      absWorkingDir: dirname(packagePath),
      chunkNames: `${flatName(name)}.[name].chunk-[hash]`,
      entryNames: `${flatName(name)}.[name]`,
      entryPoints: {}
    };

    configs.set(name, currentConfig);
  }

  const entries = new Map(Object.entries(currentConfig.entryPoints));

  const [moduleName, namedExports] = extractName(args.path);

  if (!entries.has(args.path)) {
    //       const keyPrefixSlash = key && `/${key}`;

    //       return {
    //         // in: `npm:${name}${keyPrefixSlash}`,
    //         in: `${name}${keyPrefixSlash}`,
    //         out: `${name}${keyPrefixSlash}`
    //       };

    // console.log('---', args.path, namedExports);
    entries.set(flatName(namedExports), args.path);
    currentConfig.entryPoints = Object.fromEntries(Array.from(entries.entries()));
    currentConfig.write = true;

    // console.log(name, currentConfig.entryPoints);
  }

  return `./${flatName(moduleName)}.${flatName(namedExports || moduleName.split('/').at(-1))}.js`;
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
  'adaptivecards',
  'base64-js',
  'botframework-directlinejs',
  'microsoft-cognitiveservices-speech-sdk',
  'react',
  'react-dom',
  'react-is'
];

(async () => {
  const {
    packageJson: { name }
  } = await readPackageUp({ cwd: process.argv[2] });

  configs.set(name, {
    chunkNames: `[name].chunk.[hash]`,
    entryNames: `[name]`,
    entryPoints: [
      {
        in: process.argv[2],
        // in: 'a.mjs',
        out: name
      }
    ]
  });

  for (const moduleId of CJS) {
    configs.set(moduleId, {
      chunkNames: `[name].chunk.[hash]`,
      entryNames: `[name]`,
      entryPoints: {
        [`${moduleId}.${moduleId}`]: `./external.umd/${moduleId}.ts`
      }
    });
  }

  console.log(resolve(fileURLToPath(import.meta.url), `../static/`));

  for (let i = 0; i < 10000; i++) {
    // eslint-disable-next-line no-await-in-loop
    await crawl();
  }

  console.log(configs);
})();
