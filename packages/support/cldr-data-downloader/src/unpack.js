/**
 * Download tool for Unicode CLDR JSON data
 *
 * Copyright 2021 Microsoft Corporation
 * Copyright 2013 Rafael Xavier de Souza
 *
 * Released under the MIT license
 */

'use strict';

import { mkdirSync } from 'fs';
import AdmZip from 'adm-zip';
import path from 'path';

function bowerOrPackageJson(entry) {
  return /^(bower|package)\.json/u.test(entry.entryName);
}

function getLeadingDirectory(entry) {
  return entry.entryName.split('/')[0];
}

function ignore(entry) {
  entry.entryName = '.ignored-' + entry.entryName;
}

function prettyPath(_path) {
  const relativePath = path.relative('.', _path);

  // eslint-disable-next-line no-magic-numbers
  return relativePath.length + 2 > _path.length ? _path : './' + relativePath;
}

function stripLeadingDirectory(entry) {
  return (entry.entryName = entry.entryName.split('/').slice(1).join('/'));
}

function unique(sum, i) {
  if (!~sum.indexOf(i)) {
    sum.push(i);
  }

  return sum;
}

function unpack(downloads, dest) {
  let zip;

  // eslint-disable-next-line no-console
  console.log('Unpacking it into `' + prettyPath(dest.path) + '`');

  try {
    // This is intentional and path is passed from CLI.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    mkdirSync(dest.path, { recursive: true, mode: '0755' });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }

  downloads.forEach(download => {
    let entries;

    try {
      zip = new AdmZip(download);
      entries = zip.getEntries();
      // Strip the leading directory in case it holds all files.
      if (entries.map(getLeadingDirectory).reduce(unique, []).length === 1) {
        entries.forEach(stripLeadingDirectory);
      }
      // Ignore/rename bower.json or package.json files
      entries.filter(bowerOrPackageJson).forEach(ignore);
      zip.extractAllTo(dest.path, true);
    } catch (error) {
      // AdmZip throws strings, not errors!!
      if (typeof error === 'string') {
        throw new Error(error);
      }

      throw error;
    }
  });
}

export default function (dest) {
  return function (download) {
    unpack(download, dest);
  };
}
