# Packages

Web Chat consists of multiple packages:

- [`core`](#core)
- [`component`](#component)
- [`bundle`](#bundle)
- [`directlinespeech`](#directlinespeech)
- [`embed`](#embed)
- [`isomorphic-*`](#isomorphic-*)

## `core`

Stateful data layer as Redux store.

Unlike [`BotFramework-DirectLineJS`](https://npmjs.com/package/botframework-directlinejs), this data layer is stateful. For example, visibility of suggested actions is based on previous bot activities (previous state).

## `component`

User interface layer exposed as React components.

## `bundle`

This package serves two purposes.

1. Entrypoint of our main package
1. Monolithic `.js` files

It includes 3 different bundles:

- `webchat.js` is the full bundle, contains Adaptive Cards, Cognitive Services, Direct Line Speech, Markdown, etc.
- `webchat-es5.js` is built on full bundle, contains polyfills required by ES5 browsers. For example, Internet Explorer 11.
- `webchat-minimal.js` is the minimal bundle. Does not contains Adaptive Cards, etc.
   - Minimal bundle is roughly 50% the size of full bundle

Both bundles include support of Azure Bot Services channel:

- Direct Line channel, exposed as `createDirectLine()` function
   - This will create a `directLine` adapter
   - This is almost a direct export of [`BotFramework-DirectLineJS`](https://npmjs.com/package/botframework-directlinejs) package.
- Direct Line Speech channel, exposed as `createDirectLineSpeechAdapters()` function
   - This will create an adapter set, consists of `directLine` and `webSpeechPonyfillFactory`

## `directlinespeech`

Adapter set for using Web Chat with Direct Line Speech channel.

## `embed`

IFRAME hosting page at https://webchat.botframework.com/.

## `isomorphic-*`

These are non-publishing support packages for selecting correct instance and version of `react` and `react-dom` for bundle.

For simplicity, Web Chat bundle its own version of React in `webchat*.js`. If the hosting page already loaded React as a global variable through `window.React` and `window.ReactDOM`, Web Chat will prefer that instance over its own bundled version.

## `playground`

Proving ground for Web Chat during development.

# Builds

## Favors

We offer 3 build favors:

|             | Instrumented | Minified | Source maps |
|-------------|--------------|----------|-------------|
| Production  | ❌            | ✔        | ❌           |
| Test        | ✔            | ✔        | ❌           |
| Development | ❌            | ❌        | ✔           |

> Instrumentation code is added by Istanbul via Babel.
> Minification is carried out by Terser via Webpack.
> Eval source maps took 1.6s to load in browser, while code without source maps only took 300-500ms to load

Tests run locally will be using development build without any code coverage collection.

To select different build favors, set `node_env` to:

- `production`
- `test`
- `development` or not set

## Scripts

We offer 2 types of build processes:

- `npm run prepublishOnly` will build once
- `npm start` will build continuously with watch

# Design requirements

## Bootstrap scripts

Only two NPM commands are needed to ready the repository for development:

- `npm ci`, followed by
- `npm run bootstrap`

On subsequent pulls, running `npm run tableflip` will reset all `node_modules`.

## Build scripts

- Use as much `npm run-script` commands as possible
- `npm install` should not run any scripts, no `.gyp`
- Dev mode (build development bits with watch)
   - Run `npm start`
   - Serve samples and bits from `http://localhost:5000/` (or other available ports)
   - Debug under browser with source maps enabled, displaying source code in original ESNext format
   - In browser, able to set breakpoints and break on original form of code
   - Build should be stabilized within 5 minutes, no extra steps should be taken (e.g. retouching file to trigger build, etc)
      - It is acceptable if the contributor start modifying code before the build is stabilized, their changes may not appear on the bits
- Build production bits
   - Set environment variable `node_env` to `production`
   - Run `npm run prepublishOnly`
      - Prefer `prepublishOnly` because this sounds more towards production or CI builds
      - Contributors are very unlikely to run this script
   - No instrumentation code, no source maps
   - Minified
   - Produce `webchat.js`, `webchat-es5.js` and `webchat-minimal.js`
- No more commands other than `prepublishOnly` and `start` needed to learn
- Testability
   - Under CI pipeline
      - Fresh build with instrumentation but minified (a.k.a. `node_env=test`)
         - Non-minified build contains sourcemaps and take 3-5 seconds to load on a browser
      - Run test with code coverage
   - Under local box
      1. Developer start dev mode by `npm start`, wait until build stable
      1. Run `npm test`
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
- Docker is not a requirement to run build
- Build scripts across multiple packages should largely the same and almost copyable
   - Some package use Webpack, while other do not use TypeScript, it is understandable the build script has slight differences

# Verifications

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
   - Run `npm prepublishOnly`, wait until finished
   - Verify `packages/bundle/dist/webchat.js` is about 3 MB
      - Minified
      - No instrumentation code (smaller than test builds)
- Direct Line Speech SDK
   - Development build
      - Run `npm start`, wait until stabilized
      - Verify only `dist/directlinespeech.development.js` is on disk and about 4 MB
   - Test build
      - Set `node_env` to `test`
      - Run `npm prepublishOnly`, wait until finished
         - Verify `packages/directlinespeech/dist/directlinespeech.production.min.js` is built
            - Minified
            - With instrumentation code, but no source maps
      - Run `npm test -- --ci --coverage false --maxWorkers=4 --no-watch`
         - Verify code coverage is collected and correct (`directlinespeech.production.min.js` is about 500 KB)
   - Production build
      - Set `node_env` to `production`
      - Run `npm prepublishOnly`, wait until finished
         - Verify both `dist/directlinespeech.development.js` and `dist/directlinespeech.production.min.js` is on disk
            - `dist/directlinespeech.development.js` is about 3 MB
            - `dist/directlinespeech.production.min.js` is about 400 KB
