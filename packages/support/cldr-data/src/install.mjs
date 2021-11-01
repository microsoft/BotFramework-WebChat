/**
 * Npm module for Unicode CLDR JSON data
 *
 * Copyright 2021 Microsoft Corporation
 * Copyright 2013 Rafael Xavier de Souza
 *
 * Released under the MIT license
 */

'use strict';

let coverage, parentPackage, peerPackages, srcUrl;

import { fileURLToPath } from 'url';
import { readPackageSync } from 'read-pkg';
import { readPackageUpSync } from 'read-pkg-up';
import child_process from 'child_process';
// False alarm.
// eslint-disable-next-line node/no-missing-import
import cldrDownloader from 'cldr-data-downloader';
import glob from 'glob';
import path from 'path';

const options = {};

let isNpm3;

try {
  // TODO: Wrap the work in async function and use async instead.
  // eslint-disable-next-line node/no-sync
  const npmv = child_process.execSync('npm -v').toString('utf8');
  isNpm3 = npmv.split('.')[0] === '3';
} catch (error) {
  // child_process.execSync is not available on Node v0.10
  // fortunately, we can use ENV variables set by npm do detect its version
  //   npm_config_user_agent: 'npm/2.15.1 node/v0.10.46 darwin x64'
  //   npm_config_user_agent: 'npm/3.10.3 node/v6.3.0 darwin x64'
  // Note that users can override the value of this config option,
  // therefore it's safer to use this method only as a fall-back option.
  if (/^npm\/2\./u.test(process.env.npm_config_user_agent)) {
    isNpm3 = false;
  } else {
    // Better safe than sorry.
    isNpm3 = true;
  }
}

const __dirname = fileURLToPath(new URL('.', import.meta.url));

try {
  parentPackage = readPackageUpSync({ cwd: path.join(__dirname, '../../..') }).packageJson;
  // eslint-disable-next-line no-empty
} catch (error) {}

try {
  peerPackages = glob.sync('../*/package.json').map(file => {
    try {
      return readPackageSync({ cwd: path.dirname(path.resolve(file)) });
    } catch (error) {
      return {};
    }
  });
} catch (error) {
  console.error('Warning: Something weird happened checking whether this is a peer dependency.', error.message);
  peerPackages = [];
}

if (
  !isNpm3 &&
  parentPackage &&
  !(parentPackage.dependencies && parentPackage.dependencies['cldr-data']) &&
  !(parentPackage.devDependencies && parentPackage.devDependencies['cldr-data']) &&
  peerPackages.some(peerPackage => peerPackage.peerDependencies && peerPackage.peerDependencies['cldr-data'])
) {
  console.error(
    'Warning: Skipping to download CLDR data, because `cldr-data` is a ' +
      "peer dependency. If you want it to be downloaded, make sure it's " +
      'listed under `dependencies` or `devDependencies` of the `package.json`' +
      'of your application.'
  );

  // TODO: Use `throw error` instead.
  // eslint-disable-next-line no-process-exit
  process.exit(0);
}

if (process.env.CLDR_URL) {
  console.warn('CLDR_URL is deprecated, use CLDR_DATA_URLS_JSON instead.');
  srcUrl = srcUrl.replace('http://www.unicode.org/Public/cldr', process.env.CLDR_URL.replace(/\/$/u, ''));
} else {
  if (process.env.CLDR_DATA_URLS_JSON) {
    srcUrl = process.env.CLDR_DATA_URLS_JSON;
  } else if (parentPackage && parentPackage['cldr-data-urls-json']) {
    srcUrl = parentPackage['cldr-data-urls-json'];
  } else {
    srcUrl = path.join(__dirname, '../urls.json');
  }
}

if (process.env.CLDR_COVERAGE) {
  coverage = process.env.CLDR_COVERAGE;
} else if (
  parentPackage &&
  parentPackage['cldr-data-coverage']

  // Normally, when running under npm, it will run this install script under the dependents, i.e. /packages/api/.
  // Since we are using lerna, lerna run this install script under CWD, i.e. /packages/support/cldr-data/.
  // Thus, it cannot find its true dependents (/packages/api). Thus, the "cldr-data-coverage" field cannot be found.
  // We will need put it the "cldr-data-coverage" field under root package.json, and relaxing the requirements a bit for lerna.

  // parentPackage['cldr-data-coverage'] &&
  // ((parentPackage.dependencies && parentPackage.dependencies['cldr-data']) ||
  //   (parentPackage.devDependencies && parentPackage.devDependencies['cldr-data']))
) {
  coverage = parentPackage['cldr-data-coverage'];
}

if (process.env.CLDR_DATA_URLS_FILTER) {
  options.filterRe = process.env.CLDR_DATA_URLS_FILTER;
} else if (parentPackage && parentPackage['cldr-data-urls-filter']) {
  options.filterRe = parentPackage['cldr-data-urls-filter'];
}

if (coverage) {
  options.srcUrlKey = coverage;
}

cldrDownloader(srcUrl, path.join(__dirname, '../dist'), options, error => {
  if (error) {
    if (/E_ALREADY_INSTALLED/u.test(error.code)) {
      error.message = error.message.replace(/Use `options.*/u, 'Use -f to override.');

      // eslint-disable-next-line no-console
      return console.log(error.message);
    }

    console.error('Whops', error.message);

    // TODO: Use `throw error` instead.
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
});
