/**
 * Download tool for Unicode CLDR JSON data
 *
 * Copyright 2021 Microsoft Corporation
 * Copyright 2013 Rafael Xavier de Souza
 *
 * Released under the MIT license
 */

'use strict';

import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';
import { resolve } from 'path';
import assert from 'assert';

import { isUrl, readJSON } from './util.js';
import AvailableLocales from './available_locales.js';
import download from './download.js';
import progress from './progress.js';
import Q from 'q';
import State from './state.js';
import unpack from './unpack.js';

Q.longStackSupport = true;

function alwaysArray(arrayOrSomething) {
  return Array.isArray(arrayOrSomething) ? arrayOrSomething : arrayOrSomething ? [arrayOrSomething] : [];
}

/**
 * fn( srcUrl, destPath [, options], callback )
 */
export default function (srcUrl, destPath, options, callback) {
  let error, state;

  if (callback === undefined && typeof options === 'function') {
    callback = options;
    options = {};
  }

  assert(typeof srcUrl === 'string', 'must include srcUrl (e.g., "https://www.unicode.org/Public/cldr/26/json.zip")');

  assert(typeof destPath === 'string', 'must include destPath (e.g., "./cldr")');
  assert(!/\.\./u.test(destPath), '"destPath" must not contains "..".');
  assert(!/^file:/u.test(destPath), '"destPath" must not be URL.');

  assert(typeof options === 'object', 'invalid options');

  assert(typeof callback === 'function', 'must include callback function');

  destPath = resolve(fileURLToPath(import.meta.url), destPath);

  try {
    mkdirSync(destPath, { recursive: true });
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
          // ReDOS attack should only be carried out by the user themselves.
          // eslint-disable-next-line security/detect-non-literal-regexp
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
}
