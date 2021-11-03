// "cldr-data" depends on "read-pkg-up" which must be run in ESM.
// "read-pkg-up" is required because we are using Lerna to run the install script for "cldr-data", instead of running via "npm install".
//
// Although Jest can run ESM experimentally, when enabled, it will run everything in ESM.
//
// Although we can use Babel on-the-fly with Jest to turn ESM into CJS.
//
// However, some variables works in CJS only and some works in ESM only:
//
// - CJS-only: __dirname
// - ESM-only: import.meta.url (an alternative to __dirname as an URL object)
//
// Instead of going the complex route to run Babel on-the-fly and switch variables based on mode,
// we will fork() a child process and run it as native ESM.

const { join } = require('path');

// This is for using Jest to load ESM.
// eslint-disable-next-line security/detect-child-process
const childProcess = require('child_process');

test('should load CLDR data', () =>
  new Promise((resolve, reject) =>
    childProcess
      .fork(join(__dirname, './index.spec.mjs'))
      .on('exit', exitCode => (exitCode ? reject(exitCode) : resolve()))
  ));
