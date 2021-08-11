/**
 * Download tool for Unicode CLDR JSON data
 *
 * Copyright 2021 Microsoft Corporation
 * Copyright 2013 Rafael Xavier de Souza
 *
 * Released under the MIT license
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { deepEqual, readJSON } = require('./util');

function State(srcUrl, destPath) {
  this.srcUrl = srcUrl;
  this.destPath = destPath;
  this.installed = this.isInstalled();
}

const proto = State.prototype;

proto.filepath = function () {
  return path.join(this.destPath, 'state.json');
};

proto.isInstalled = function () {
  return deepEqual(this.read(), this.toJson());
};

proto.read = function () {
  const filepath = this.filepath();

  if (fs.existsSync(filepath)) {
    return readJSON(filepath);
  }

  return {};
};

proto.toJson = function () {
  return {
    url: this.srcUrl
  };
};

proto.write = function () {
  // eslint-disable-next-line no-magic-numbers
  const data = JSON.stringify(this.toJson(), null, 2);

  fs.writeFileSync(this.filepath(), data);
};

module.exports = State;
