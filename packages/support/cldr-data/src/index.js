/**
 * Npm module for Unicode CLDR JSON data
 *
 * Copyright 2021 Microsoft Corporation
 * Copyright 2013 Rafael Xavier de Souza
 *
 * Released under the MIT license
 */

'use strict';

const JSON_EXTENSION = /^(.*)\.json$/u;

const assert = require('assert');
const _fs = require('fs');
const _path = require('path');

function argsToArray(arg) {
  return [].slice.call(arg, 0);
}

function jsonFiles(dirName) {
  const fileList = _fs.readdirSync(_path.join(__dirname, '../dist', dirName));

  return fileList.reduce((sum, file) => {
    if (JSON_EXTENSION.test(file)) {
      return sum.concat(file.match(JSON_EXTENSION)[1]);
    }
  }, []);
}

function cldrData(...args) {
  const [path] = args;

  assert(typeof path === 'string', 'must include path (e.g., "main/en/numbers" or "supplemental/likelySubtags")');

  if (args.length > 1) {
    return argsToArray(args).reduce((sum, path) => {
      sum.push(cldrData(path));
      return sum;
    }, []);
  }

  return JSON.parse(_fs.readFileSync(_path.join(__dirname, '../dist/', path + '.json')));
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

module.exports = cldrData;
