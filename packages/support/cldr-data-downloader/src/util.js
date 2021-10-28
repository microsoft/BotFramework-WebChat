/**
 * Download tool for Unicode CLDR JSON data
 *
 * Copyright 2021 Microsoft Corporation
 * Copyright 2013 Rafael Xavier de Souza
 *
 * Released under the MIT license
 */

'use strict';

import assert from 'assert';
import fs from 'fs';

function deepEqual(a, b) {
  try {
    assert.deepEqual(a, b);
  } catch (error) {
    if (error instanceof assert.AssertionError) {
      return false;
    }

    throw error;
  }

  return true;
}

function isUrl(urlOrPath) {
  try {
    // eslint-disable-next-line no-new
    new URL(urlOrPath);

    return true;
  } catch (err) {
    return false;
  }
}

function readJSON(filepath) {
  // TODO: Consider using in-memory file system.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return JSON.parse(fs.readFileSync(filepath));
}

export { deepEqual, isUrl, readJSON };
