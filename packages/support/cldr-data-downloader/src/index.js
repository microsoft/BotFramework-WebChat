/**
 * Download tool for Unicode CLDR JSON data
 *
 * Copyright 2021 Microsoft Corporation
 * Copyright 2013 Rafael Xavier de Souza
 *
 * Released under the MIT license
 */

'use strict';

const { mkdirSync } = require('fs');
const { resolve } = require('path');
const assert = require('assert');

const { isUrl, readJSON } = require('./util');
const AvailableLocales = require('./available_locales');
const download = require('./download');
const progress = require('./progress');
const Q = require('q');
const State = require('./state');
const unpack = require('./unpack');

Q.longStackSupport = true;

function alwaysArray(arrayOrSomething) {
  return Array.isArray(arrayOrSomething) ? arrayOrSomething : arrayOrSomething ? [arrayOrSomething] : [];
}

/**
 * fn( srcUrl, destPath [, options], callback )
 */
module.exports = function (srcUrl, destPath, options, callback) {
  let error, state;

  if (callback === undefined && typeof options === 'function') {
    callback = options;
    options = {};
  }

  assert(typeof srcUrl === 'string', 'must include srcUrl (e.g., "http://www.unicode.org/Public/cldr/26/json.zip")');

  assert(typeof destPath === 'string', 'must include destPath (e.g., "./cldr")');

  assert(typeof options === 'object', 'invalid options');

  assert(typeof callback === 'function', 'must include callback function');

  try {
    mkdirSync(resolve(__dirname, destPath), { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }

  Q.try(() => {
    // Is srcUrl a config file?
    if (!isUrl(srcUrl) && /.json$/iu.test(srcUrl)) {
      // Read its URL.
      options.srcUrlKey = options.srcUrlKey || 'core';
      srcUrl = readJSON(srcUrl)[options.srcUrlKey];
    }

    // Is it already installed?
    state = new State(srcUrl, destPath);
    if (!options.force && state.isInstalled()) {
      error = new Error('Already downloaded and unpacked, quitting... Use `options.force = true` to override.');
      error.code = 'E_ALREADY_INSTALLED';
      throw error;
    }

    // Download
  })
    .then(() => {
      let srcUrls = alwaysArray(srcUrl);

      if (options.filterRe) {
        let { filterRe } = options;

        if (typeof filterRe === 'string') {
          filterRe = new RegExp(filterRe, 'u');
        }

        srcUrls = srcUrls.filter(url => filterRe.test(url));
      }

      return Q.all(
        srcUrls.map(srcUrl =>
          download({
            url: srcUrl
          })
        )
      ).progress(progress(srcUrls.length));

      // Unpack
    })
    .then(
      unpack({
        path: destPath

        // Generate available locales.
      })
    )
    .then(() => {
      try {
        new AvailableLocales(destPath).write();
      } catch (error) {
        error.message = 'Error generating available locales. ' + error.message;

        throw error;
      }

      // Save installation state.
    })
    .then(() => {
      try {
        state.write();
      } catch (error) {
        error.message = 'Error saving installation state. ' + error.message;

        throw error;
      }

      // Done
    })
    .nodeify(callback);
};
