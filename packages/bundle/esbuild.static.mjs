/* eslint-disable no-magic-numbers */
/* eslint-disable arrow-body-style */
/* eslint-disable require-unicode-regexp */
/// <reference types="node" />

import * as esbuild from 'esbuild';
import { resolve as importMetaResolve } from 'import-meta-resolve';
import { dirname, resolve } from 'path';
import { readPackageUp } from 'read-pkg-up';
import { fileURLToPath, pathToFileURL } from 'url';

const CJS = [
  'adaptivecards@3.0.2',
  'base64-js@1.5.1',
  'botframework-directlinejs@0.15.6',
  'react@16.8.6',
  'react-dom@16.8.6',
  'react-is@17.0.2'
];

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

async function addConfig(
  /** @type { import('esbuild').OnResolveArgs } */
  args
) {
  const fileURL = importMetaResolve(args.path, pathToFileURL(args.resolveDir) + '/');

  if (fileURL.startsWith('node:')) {
    return;
  }

  const result = fileURLToPath(fileURL);
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
      banner: { js: `/* botframework-webchat@0.0.0-0 - ${fullName} */` },
      chunkNames: `${flatName(name)}__${version}__[name]-[hash]`,
      entryNames,
      entryPoints: {}
    };

    configs.set(fullName, currentConfig);
  }

  const entries = new Map(Object.entries(currentConfig.entryPoints));

  const [moduleName, namedExports] = extractName(args.path);
  const entryName = flatName(namedExports || moduleName.split('/').at(-1));

  if (!entries.has(entryName)) {
    // console.log('---', args.path, namedExports);
    entries.set(entryName, args.path);
    currentConfig.entryPoints = Object.fromEntries(Array.from(entries.entries()));
    currentConfig.write = true;

    // console.log(name, currentConfig.entryPoints);
  }

  return `./${entryNames.replace(/\[name\]/g, flatName(namedExports || moduleName.split('/').at(-1)))}.js`;
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
      alias: {
        'microsoft-cognitiveservices-speech-sdk': '@msinternal/microsoft-cognitiveservices-speech-sdk'
      },
      bundle: true,
      format: 'esm',
      loader: { '.js': 'jsx' },
      // minify: true,
      outdir: resolve(fileURLToPath(import.meta.url), `../static/`),
      platform: 'browser',
      sourcemap: true,
      splitting: true,
      write: true,
      /** @type { import('esbuild').Plugin[] } */
      plugins: [
        // umdResolvePlugin,
        {
          name: 'static-builder',
          setup(build) {
            // build.onLoad({ filter: /.*/ }, async args => {
            //   try {
            //     // eslint-disable-next-line security/detect-non-literal-fs-filename
            //     const source = await readFile(args.path, { encoding: 'utf-8' });

            //     // if (args.path.includes('/react/')) {
            //     //   console.log(source);
            //     // }

            //     // if (args.path.includes('html-dom-parser')) {
            //     //   console.log(args);
            //     // }

            //     const root = parse(Lang.JavaScript, source).root();

            //     const node = root.find('module.exports = require($MATCH)');
            //     const edit = node.replace(
            //       `export * from ${node.getMatch('MATCH').text()}; export { default } from ${node.getMatch('MATCH').text()};`
            //     );

            //     const node3 = root.find('module.exports = $MATCH');
            //     const edit3 = node3.replace(`export default ${node.getMatch('MATCH').text()};`);

            //     // console.log(node);

            //     const node2 = root.findAll('var $VAR = require($MODULE);');
            //     // console.log(node2);
            //     const edit2 = node2.map(node =>
            //       node.replace(`import ${node.getMatch('VAR').text()} from ${node.getMatch('MODULE').text()};`)
            //     );

            //     if (args.path === 'hoist-non-react-statics') {
            //       console.log(edit2);
            //     }

            //     const newSource = node.commitEdits([edit, ...edit2, edit3]);

            //     return { contents: newSource };
            //   } catch (error) {
            //     return undefined;
            //   }
            // });

            build.onResolve({ filter: /^[^.]/ }, async args => {
              if (args.path === 'mime') {
                return undefined;
              }

              if (args.kind === 'import-statement') {
                // Prevent external.umd from looping to self.
                if (args.importer.includes('external.umd')) {
                  return undefined;
                }

                // for (const fullName of CJS) {
                //   const [name] = fullName.split('@');

                //   if (args.path === name && args.importer.endsWith(`/${fullName}.ts`)) {
                //     // Prevent external.umd from looping to self.
                //     return undefined;
                //   }
                // }

                const path = await addConfig(args);

                if (!path) {
                  return undefined;
                }

                importMap.set(args.path, path);

                return { external: true, path };
              } else if (args.kind === 'require-call') {
                if (args.path === 'react') {
                  return { path: 'stub:react', namespace: 'stub' };
                }
              }

              return undefined;
            });

            build.onLoad({ filter: /^stub:react$/, namespace: 'stub' }, () => ({
              contents: "export * from 'react'; export { default } from 'react';",
              resolveDir: resolve(fileURLToPath(import.meta.url), '../static')
            }));
          }
        }
      ]
    });

    config.write = false;
  }
}

(async () => {
  const name = process.argv[3];

  configs.set('', {
    banner: { js: `/* botframework-webchat@0.0.0-0 */` },
    chunkNames: `[name]-[hash]`,
    entryNames: `[name]`,
    entryPoints: [{ in: process.argv[2], out: name }]
  });

  for (const moduleId of CJS) {
    configs.set(moduleId, {
      banner: { js: `/* botframework-webchat@0.0.0-0 - ${moduleId} */` },
      chunkNames: `${flatName(moduleId.replace('@', '__'))}__[name]-[hash]`,
      entryNames: `${flatName(moduleId.replace('@', '__'))}__[name]`,
      entryPoints: {
        [`${moduleId.split('@')[0]}`]: `./external.umd/${moduleId}.ts`
      }
    });
  }

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
