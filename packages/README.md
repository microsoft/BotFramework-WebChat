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

# Build scripts

## Favors

We offer 2 types of build favors:

|             | Instrumented | Minified |
|-------------|--------------|----------|
| Production  | ❌            | ✔        |
| Development | ✔            | ❌        |

> Instrumentation code is added by Istanbul via Babel.
> Minification is carried out by Terser via Webpack.

## Scripts

To build for development bits, explicitly set environment variable `node_env` to `test`. This behavior is to match Jest behavior on automatic instrumentation code injection when `node_env` is set to `test` (a.k.a. running under test infrastructure, where code coverage will be collected.)

We offer 2 types of build processes:

- `start` will always produce bits in development mode and run with watch.
- `prepublishOnly` will produce either development or production bits, depends on `node_env` is set or not.

# Design requirements

## Bootstrap scripts

Only two commands is needed to set up the repository:

- `npm ci`, followed by
- `npm run bootstrap`

On subsequent pulls:

- `npm run tableflip`

## Build scripts

- Use as much `npm run-script` commands as possible
- `npm install` should not run any scripts, no `.gyp`
- Dev mode (build development bits with watch)
   - Single command, `npm start`
   - Serve samples and bits from `http://localhost:5000/` (or other available ports)
   - Debug under browser with source maps enabled, displaying source code in original ESNext format
   - In browser, able to set breakpoints and break on original form of code
   - Build should be stabilized within 5 minutes, no extra steps should be taken (e.g. retouching file to trigger build, etc)
      - It is acceptable if the contributor start modifying code before the build is stabilized, their changes may not appear on the bits
- Build production bits
   - Single command, `npm run prepublishOnly`
      - Prefer `prepublishOnly` because this sounds more towards production or CI builds
      - Contributors are very unlikely to run this script
   - No instrumentation code
   - Minified
   - Produce `webchat.js`, `webchat-es5.js` and `webchat-minimal.js`
- No more commands other than `prepublishOnly` and `start` needed to learn
- Testability
   - Under CI pipeline
      - Fresh build with instrumentation
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
