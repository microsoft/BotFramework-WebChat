/**
 * Npm module for Unicode CLDR JSON data
 *
 * Copyright 2021 Microsoft Corporation
 * Copyright 2013 Rafael Xavier de Souza
 *
 * Released under the MIT license
 */

'use strict';

import assert from 'assert';
import _fs from 'fs';
import _path from 'path';

const JSON_EXTENSION = /^(.*)\.json$/u;

function argsToArray(arg) {
  return [].slice.call(arg, 0);
}

function jsonFiles(dirName) {
  assert(!/\.\./u.test(dirName), '"dirname" must not contains ".."');

  // Mitigated by denying "dirName" to contains "..".
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const fileList = _fs.readdirSync(new URL(_path.join('../dist', dirName), import.meta.url));

  return fileList.reduce((sum, file) => {
    if (JSON_EXTENSION.test(file)) {
      return sum.concat(file.match(JSON_EXTENSION)[1]);
    }
  }, []);
}

function cldrData(...args) {
  const [path] = args;

  assert(typeof path === 'string', 'must include path (e.g., "main/en/numbers" or "supplemental/likelySubtags")');
  assert(!/\.\./u.test(path), 'path must not contains ".."');

  if (args.length > 1) {
    return argsToArray(args).reduce((sum, path) => {
      sum.push(cldrData(path));
      return sum;
    }, []);
  }

  // Mitigated by denying "path" to contains "..".
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return JSON.parse(_fs.readFileSync(new URL(_path.join('../dist/', path + '.json'), import.meta.url)));
}

function mainPathsFor(locales) {
  return locales.reduce((sum, locale) => {
    const mainFiles = jsonFiles(_path.join('main', locale));

    mainFiles.forEach(mainFile => {
      sum.push(_path.join('main', locale, mainFile));
    });

    return sum;
  }, []);
}

function supplementalPaths() {
  const supplementalFiles = jsonFiles('supplemental');

  return supplementalFiles.map(supplementalFile => _path.join('supplemental', supplementalFile));
}

Object.defineProperty(cldrData, 'availableLocales', {
  get() {
    return cldrData('availableLocales').availableLocales;
  }
});

cldrData.all = function () {
  const paths = supplementalPaths().concat(mainPathsFor(this.availableLocales));

  return cldrData.apply({}, paths);
};

cldrData.entireMainFor = function (...args) {
  const [locale] = args;

  assert(typeof locale === 'string', 'must include locale (e.g., "en")');

  return cldrData.apply({}, mainPathsFor(argsToArray(args)));
};

cldrData.entireSupplemental = function () {
  return cldrData.apply({}, supplementalPaths());
};

export default cldrData;
