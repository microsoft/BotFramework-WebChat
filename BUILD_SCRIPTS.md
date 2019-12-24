# Build scripts

This article outline our design for build scripts.

## Design requirements

This section lists requirements for an efficient design of build scripts.

### Bootstrap scripts

Only two NPM commands are needed to ready the repository for development:

- `npm ci`, followed by
- `npm run bootstrap`

On subsequent pulls, running `npm run tableflip` will reset all `node_modules`.

### Build scripts

- Zero pollution
   - No `npm install -g`
   - Do not publish build artifacts to GitHub
- Intuitive
   - Use as much `npm run-script` commands as possible
   - No commands other than `build` and `start` needed to learn
      - `build` means build once
      - `start` means build continuously
   - Build scripts across multiple packages should largely the same and almost copyable
      - Some package use Webpack, while other do not use TypeScript, it is understandable the build script has slight differences
   - Use `node_env` for different build favors
      - `development` or unspecified, means development build
      - `production` means production build
      - `test` means testing build
         - This build should be functionally similar to production build with instrumentation code
- Cross platform
   - All scripts should run on both Windows and Linux
   - `npm install` should not run any scripts, no `.gyp`
- Optimized to run as fast as possible
   - Incremental build should complete within 2-4 seconds

### Implementations

- Dev mode (build development bits with watch)
   - Run `npm start`
   - Serve samples and bits from `http://localhost:5000/` (or other available ports)
   - Debug under browser with source maps enabled, displaying source code in original ESNext format
   - In browser, able to set breakpoints and break on original form of code
   - Build should be stabilized within 5 minutes, no extra steps should be taken (e.g. retouching file to trigger build, etc)
      - It is acceptable if the contributor start modifying code before the build is stabilized, their changes may not appear on the bits
- Build production bits
   - Set environment variable `node_env` to `production`
   - No instrumentation code, no source maps
   - Minified
   - Produce `webchat.js`, `webchat-es5.js` and `webchat-minimal.js`
- Testability
   - Under CI pipeline on Ubuntu
      - Fresh build with instrumentation but minified (a.k.a. `node_env=test`)
         - Non-minified build contains sourcemaps and take 3-5 seconds to load on a browser
      - Run test with code coverage data
   - Under local box
      1. Developer start dev mode by `npm start`, wait until build stable
      1. Run `npm test`
        - No code coverage data is required to collect
   - Test results
      - Tests running under CI pipeline must produce code coverage and test results in VSTS absorbable format
      - `npm test` at root must test all production packages
      - `directlinespeech`
         - Run `npm test` under `/packages/directlinespeech`, it must able to test independently
      - `embed`
         - Run `npm test` under `/packages/embed`, it must able to test independently
      - Other packages do not need to be tested independently
- Webpack stats
   - Produce `stats.json` to visualize content of Webpack

## Design verifications

This section lists verification steps to validate the implementation against the design.

- Development build
   - Verify `node_env` is not set
   - Run `npm start`, wait until stabilized
      - Verify only one pass of Babel is done on each package
   - Open http://localhost:5000/
      - Verify page load time is less than 4 seconds
   - Open developer tools
   - Go to "Source" tab
      - Verify the source code can be seen under `botframework-webchat`
         - Verify all 4 packages can be seen: `bundle:///src`, `component:///src`, `core:///src`, `directlinespeech:///src`
      - Verify breakpoints will break correctly
   - Make a change
      - Verify Webpack took less than 4 seconds
- Test build
   - Set `node_env` is set to `test`
   - Run `npm start`, wait until stabilized
      - Verify `packages/bundle/dist/webchat.js` is about 3 MB
         - Minified
         - With instrumentation code, but no source maps
   - Run `npm test -- --ci --coverage false --maxWorkers=4 --no-watch`
      - Verify code coverage is collected and correct
- Production build
   - Set `node_env` is set to `production`
   - Run `npm build`, wait until finished
   - Verify `packages/bundle/dist/webchat.js` is about 3 MB
      - Minified
      - No instrumentation code (smaller than test builds)
- Direct Line Speech SDK
   - Development build
      - Run `npm start`, wait until stabilized
      - Verify only `dist/directlinespeech.development.js` is on disk and about 4 MB
   - Test build
      - Set `node_env` to `test`
      - Run `npm build`, wait until finished
         - Verify `packages/directlinespeech/dist/directlinespeech.production.min.js` is built
            - Minified
            - With instrumentation code, but no source maps
      - Run `npm test -- --ci --coverage false --maxWorkers=4 --no-watch`
         - Verify code coverage is collected and correct (`directlinespeech.production.min.js` is about 500 KB)
   - Production build
      - Set `node_env` to `production`
      - Run `npm build`, wait until finished
         - Verify both `dist/directlinespeech.development.js` and `dist/directlinespeech.production.min.js` is on disk
            - `dist/directlinespeech.development.js` is about 3 MB
            - `dist/directlinespeech.production.min.js` is about 400 KB
