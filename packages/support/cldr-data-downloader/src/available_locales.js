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
import path from 'path';

function AvailableLocales(destPath) {
  assert(!/\.\./u.test(destPath), '"destPath" must not contains ".."');

  const mainPath = path.join(destPath, 'main');

  // Mitigated by asserting "destPath" does not contains "..".
  // TODO: Turn this into async.
  // eslint-disable-next-line security/detect-non-literal-fs-filename, node/no-sync
  this.availableLocales = fs.readdirSync(mainPath).filter(filepath => {
    // Mitigated by asserting "destPath" does not contains "..".
    // TODO: Turn this into async.
    // eslint-disable-next-line security/detect-non-literal-fs-filename, node/no-sync
    const stats = fs.statSync(path.join(mainPath, filepath));

    return stats.isDirectory();
  });

  this.destPath = destPath;
}

const proto = AvailableLocales.prototype;

proto.filepath = function () {
  return path.join(this.destPath, 'availableLocales.json');
};

proto.toJson = function () {
  return {
    availableLocales: this.availableLocales
  };
};

proto.write = function () {
  // eslint-disable-next-line no-magic-numbers
  const data = JSON.stringify(this.toJson(), null, 2);
  const filepath = this.filepath();

  assert(!/\.\./u.test(filepath), '"filepath" must not contains ".."');

  // "filepath" is clean.
  // TODO: Turn this into async.
  // eslint-disable-next-line security/detect-non-literal-fs-filename, node/no-sync
  fs.writeFileSync(filepath, data);
};

export default AvailableLocales;
