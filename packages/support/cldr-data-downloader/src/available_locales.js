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
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  this.availableLocales = fs.readdirSync(mainPath).filter(filepath => {
    // Mitigated by asserting "destPath" does not contains "..".
    // eslint-disable-next-line security/detect-non-literal-fs-filename
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

  // filepath() is clean.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(this.filepath(), data);
};

export default AvailableLocales;
