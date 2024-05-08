# Packages

Web Chat consists of the following packages:

-  [`base`](#bae)
-  [`core`](#core)
-  [`component`](#component)
-  [`bundle`](#bundle)
-  [`directlinespeech`](#directlinespeech)
-  [`embed`](#embed)
-  [`isomorphic-*`](#isomorphic-*)

## `base`

Essentials and utilities used in the project.

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

-  `webchat.js` is the full bundle, contains Adaptive Cards, Cognitive Services, Direct Line Speech, Markdown, etc.
-  `webchat-es5.js` is built on top of full bundle, and contains polyfills required by ES5 browsers. For example, Internet Explorer 11.
-  `webchat-minimal.js` is the minimal bundle. It does not contain Adaptive Cards, etc.
   -  Minimal bundle is roughly 50% the size of full bundle

Both bundles include support of Azure Bot Services channel:

-  Direct Line channel, exposed as `createDirectLine()` function
   -  Supported via a `directLine` adapter
   -  This is almost a direct export of [`BotFramework-DirectLineJS`](https://npmjs.com/package/botframework-directlinejs) package.
-  Direct Line Speech channel, exposed as `createDirectLineSpeechAdapters()` function
   -  This is an adapter set consisting of `directLine` and `webSpeechPonyfillFactory`

## `directlinespeech`

Adapter set for using Web Chat with Direct Line Speech channel.

## `embed`

IFRAME hosting page at https://webchat.botframework.com/.

## `isomorphic-*`

These are non-published support packages for selecting the correct instance and version of `react` and `react-dom` for bundle.

For simplicity, Web Chat bundle its own version of React in `webchat*.js`. If the hosting page already loaded React as a global variable through `window.React` and `window.ReactDOM`, Web Chat prioritizes that instance over its own bundled version.

## `playground`

Proving ground for Web Chat during development. Local changes to Web Chat will be reflected in the playground.

# Builds

For all packages, there are a total of 3 flavors and 2 build scripts.

## Flavors

We offer 3 build flavors:

|             | Instrumented | Minified | Source maps |
| ----------- | ------------ | -------- | ----------- |
| Production  | ❌           | ✔       | ❌          |
| Test        | ✔           | ✔       | ❌          |
| Development | ❌           | ❌       | ✔          |

> Instrumentation code is added by Istanbul via Babel.
> Minification is carried out by Terser via Webpack.
> Eval source maps took 1.6s to load in browser, while code without source maps only took 300-500ms to load. Thus, test build should not contains source maps.

Tests run locally will use the development build without any code coverage collection.

To select different build flavors, set `node_env` to:

-  `production`
-  `test`
-  `development` (default)

## Scripts

We offer 2 types of build processes:

-  `npm run build` will build once
-  `npm start` will build continuously with watch
