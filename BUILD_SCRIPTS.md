# Build scripts

This article outlines the Web Chat build scripts design.

## Design requirements

This section lists the requirements for an efficient design of build scripts. The Web Chat code closely follows the guidelines below.

### Bootstrap scripts

Only two NPM commands are needed to ready the repository for development:

-  `npm ci`, followed by
-  `npm run bootstrap`

On subsequent pulls, running `npm run tableflip` will reset all `node_modules`.

### Build scripts

-  Zero pollution
   -  No `npm install -g` are needed to build and run
   -  Does not publish build artifacts to GitHub
-  Intuitive
   -  Use as many `npm run-script` commands as possible
   -  No requirement on learning scripts other than `build` and `start`
      -  `build`: build the `packages` directory once
      -  `start`: build the `packages` directory continuously
   -  Build scripts across multiple packages are as similar as possible
      -  There are understandable differences, like one package using TypeScript or Webpack while another one does not
   -  Use `node_env` for different build flavors, described below
      -  `development` (or unspecified): run with development build
      -  `production`: run with production build
      -  `test`: run with test build
         -  This build is functionally identical to the production build, with instrumentation code added
-  Cross platform
   -  All scripts run on both Windows and Linux
   -  `npm install` does not run any scripts such as `.gyp`
-  Optimize to run as fast as possible
   -  Incremental build completes in 2-4 seconds

### Implementations

-  Development mode (build development bits with watch):
   -  Run `npm start`
   -  Serve samples and bits from `http://localhost:5000/` (or other available ports)
   -  Debug in the browser with source maps enabled, which displays source code in original ESNext format
   -  In browser, developers may set breakpoints and break on an original line of code
   -  Full build is completed within 5 minutes and does not require superfluous steps
      -  If the contributor modifies code before the build completes, their changes may not appear in that build's bits
-  Build production bits:
   -  Set environment variable `node_env` to `production`
   -  This bundle does not contain instrumentation code or source maps
   -  The code is minified
   -  Produces `webchat.js`, `webchat-es5.js` and `webchat-minimal.js`
-  Testability:
   -  Under CI pipeline on Ubuntu
      -  Fresh build with instrumentation but minified (a.k.a. `node_env=test`)
         -  Non-minified build contains sourcemaps and take 3-5 seconds to load on a browser
      -  Run tests with code coverage data
   -  Under local box
      1. Developer may start dev mode by `npm start`, then wait until the build is stable
      1. Run `npm test`
      -  Collecting code coverage data is not required
   -  Test results
      -  Tests running under CI pipeline must produce code coverage and test results in VSTS absorbable format
      -  `npm test` at root must test all production packages
      -  `directlinespeech`
         -  Run `npm test` under `/packages/directlinespeech`; it must able to test independently
      -  `embed`
         -  Run `npm test` under `/packages/embed`; it must able to test independently
      -  Other packages do not need to be tested independently
-  Webpack stats:
   -  Produce `stats.json` to visualize the content of Webpack

## Design verifications

This section lists verification steps to validate the implementation against the design.

-  Development build
   -  Verify `node_env` is not set
   -  Run `npm start` and wait until stabilized
      -  Verify only one pass of Babel is done in each package
   -  Open http://localhost:5000/
      -  Verify page load time is less than 4 seconds
   -  Open developer tools
   -  Go to "Source" tab
      -  Verify the source code can be seen under `botframework-webchat`
         -  Verify all 4 packages can be seen: `bundle:///src`, `component:///src`, `core:///src`, `directlinespeech:///src`
      -  Verify breakpoints break correctly
   -  Make a change
      -  Verify Webpack took less than 4 seconds
-  Test build
   -  Verify `node_env` is set to `test`
   -  Run `npm start` and wait until stabilized
      -  Verify `packages/bundle/dist/webchat.js` is about 3 MB
         -  Minified
         -  Contains instrumentation code but no source maps
   -  Run `npm test -- --ci --coverage false --maxWorkers=4 --no-watch`
      -  Verify code coverage is collected and correct
-  Production build
   -  Verify `node_env` is set to `production`
   -  Run `npm build` and wait until finished
   -  Verify `packages/bundle/dist/webchat.js` is about 3 MB
      -  Minified
      -  No instrumentation code (smaller than test builds)
-  Direct Line Speech SDK
   -  Development build
      -  Run `npm start` and wait until stabilized
      -  Verify only `dist/directlinespeech.development.js` is on disk and is about 4 MB in size
   -  Test build
      -  Set `node_env` to `test`
      -  Run `npm build` and wait until finished
         -  Verify `packages/directlinespeech/dist/directlinespeech.production.min.js` is built
            -  Minified
            -  Contains instrumentation code but no source maps
      -  Run `npm test -- --ci --coverage false --maxWorkers=4 --no-watch`
         -  Verify code coverage is collected and correct (`directlinespeech.production.min.js` is about 500 KB)
   -  Production build
      -  Set `node_env` to `production`
      -  Run `npm build` and wait until finished
         -  Verify both `dist/directlinespeech.development.js` and `dist/directlinespeech.production.min.js` are on disk
            -  `dist/directlinespeech.development.js` is about 3 MB
            -  `dist/directlinespeech.production.min.js` is about 400 KB
