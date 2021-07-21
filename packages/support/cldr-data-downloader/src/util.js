/**
 * Download tool for Unicode CLDR JSON data
 *
 * Copyright 2021 Microsoft Corporation
 * Copyright 2013 Rafael Xavier de Souza
 *
 * Released under the MIT license
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const URL = require('url');

module.exports = {
  deepEqual: (a, b) => {
    try {
      assert.deepEqual(a, b);
    } catch (error) {
      if (error instanceof assert.AssertionError) {
        return false;
      }

      throw error;
    }

    return true;
  },

  isUrl: urlOrPath => {
    urlOrPath = URL.parse(urlOrPath);

    return urlOrPath.hostname ? true : false;
  },

  readJSON: filepath => JSON.parse(fs.readFileSync(filepath))
};
