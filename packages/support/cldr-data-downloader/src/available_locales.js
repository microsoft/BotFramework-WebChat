/**
 * Download tool for Unicode CLDR JSON data
 *
 * Copyright 2021 Microsoft Corporation
 * Copyright 2013 Rafael Xavier de Souza
 *
 * Released under the MIT license
 */

'use strict';

import fs from 'fs';
import path from 'path';

function AvailableLocales(destPath) {
  const mainPath = path.join(destPath, 'main');

  this.availableLocales = fs.readdirSync(mainPath).filter(filepath => {
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

  fs.writeFileSync(this.filepath(), data);
};

export default AvailableLocales;
