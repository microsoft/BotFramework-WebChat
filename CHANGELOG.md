# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!-- CHANGELOG line template
### Added/Changed/Removed
-  Adds something, by [@johndoe](https://github.com/johndoe), in PR [#XXX](https://github.com/microsoft/BotFramework-WebChat/pull/XXX)

### Changed (for dependency bumps)
-  `core`: Bumps to [`abc@1.2.3`](https://npmjs.com/package/abc/), by [@johndoe](https://github.com/johndoe), in PR [#XXX](https://github.com/microsoft/BotFramework-WebChat/pull/XXX)

### Fixed
-  Fixes [#XXX](https://github.com/microsoft/BotFramework-WebChat/issues/XXX). Patched something, by [@johndoe](https://github.com/johndoe) in PR [#XXX](https://github.com/microsoft/BotFramework-WebChat/pull/XXX)
-->

<!-- ### Added
-  Resolves [#XXX](https://github.com/microsoft/BotFramework-WebChat/issues/XXX). Added something, by [@johndoe](https://github.com/johndoe), in PR [#XXX](https://github.com/microsoft/BotFramework-WebChat/pull/XXX)
-->

## [Unreleased]

### Changed

-  Bumped all dependencies to the latest versions, by [@compulim](https://github.com/compulim) in PR [#5174](https://github.com/microsoft/BotFramework-WebChat/pull/5174)
   -  Production dependencies
      -  [`classnames@2.5.1`](https://npmjs.com/package/classnames)
      -  [`core-js@3.37.0`](https://npmjs.com/package/core-js)
      -  [`deep-freeze-strict@1.1.1`](https://npmjs.com/package/deep-freeze-strict)
      -  [`markdown-it@14.1.0`](https://npmjs.com/package/markdown-it)
      -  [`merge-refs@1.3.0`](https://npmjs.com/package/merge-refs)
      -  [`mime@4.0.3`](https://npmjs.com/package/mime)
      -  [`p-defer@4.0.1`](https://npmjs.com/package/p-defer)
      -  [`redux-saga@1.3.0`](https://npmjs.com/package/redux-saga)
      -  [`redux@5.0.1`](https://npmjs.com/package/redux)
      -  [`sanitize-html@2.13.0`](https://npmjs.com/package/sanitize-html)
      -  [`swiper@8.4.7`](https://npmjs.com/package/swiper)
      -  [`whatwg-fetch@3.6.20`](https://npmjs.com/package/whatwg-fetch)
   -  Development dependencies
      -  [`@fluentui/react-components@9.49.2`](https://npmjs.com/package/@fluentui/react-components)
      -  [`@types/node@20.12.11`](https://npmjs.com/package/@types/node)
      -  [`@typescript-eslint/eslint-plugin@7.8.0`](https://npmjs.com/package/@typescript-eslint/eslint-plugin)
      -  [`@typescript-eslint/parser@7.8.0`](https://npmjs.com/package/@typescript-eslint/parser)
      -  [`adm-zip@0.5.12`](https://npmjs.com/package/adm-zip)
      -  [`dotenv@16.4.5`](https://npmjs.com/package/dotenv)
      -  [`esbuild@0.21.1`](https://npmjs.com/package/esbuild)
      -  [`eslint-plugin-import@2.29.1`](https://npmjs.com/package/eslint-plugin-import)
      -  [`eslint-plugin-prettier@5.1.3`](https://npmjs.com/package/eslint-plugin-prettier)
      -  [`eslint-plugin-react-hooks@4.6.2`](https://npmjs.com/package/eslint-plugin-react-hooks)
      -  [`eslint-plugin-react@7.34.1`](https://npmjs.com/package/eslint-plugin-react)
      -  [`eslint-plugin-security@3.0.0`](https://npmjs.com/package/eslint-plugin-security)
      -  [`eslint@8.57.0`](https://npmjs.com/package/eslint)
      -  [`html-webpack-plugin@5.6.0`](https://npmjs.com/package/html-webpack-plugin)
      -  [`husky@9.0.11`](https://npmjs.com/package/husky)
      -  [`jest-image-snapshot@6.4.0`](https://npmjs.com/package/jest-image-snapshot)
      -  [`lint-staged@15.2.2`](https://npmjs.com/package/lint-staged)
      -  [`nodemon@3.1.0`](https://npmjs.com/package/nodemon)
      -  [`nopt@7.2.1`](https://npmjs.com/package/nopt)
      -  [`p-defer@4.0.1`](https://npmjs.com/package/p-defer)
      -  [`prettier@3.2.5`](https://npmjs.com/package/prettier)
      -  [`selenium-webdriver@4.20.0`](https://npmjs.com/package/selenium-webdriver)
      -  [`serve@14.2.3`](https://npmjs.com/package/serve)
      -  [`source-map-loader@5.0.0`](https://npmjs.com/package/source-map-loader)
      -  [`terser-webpack-plugin@5.3.10`](https://npmjs.com/package/terser-webpack-plugin)
      -  [`tsd@0.31.0`](https://npmjs.com/package/tsd)
      -  [`type-fest@4.18.2`](https://npmjs.com/package/type-fest)
      -  [`typescript@5.4.5`](https://npmjs.com/package/typescript)
      -  [`webpack@5.91.0`](https://npmjs.com/package/webpack)

## [4.17.0] - 2024-05-06

### Known issues

-  Web Chat is not loading with error `Uncaught TypeError: Super constructor null of anonymous class is not a constructor`
   -  A [bug in webpack@>=5.84.1](https://github.com/webpack/webpack/issues/17711) is causing the issue. Please update to [`webpack@>=5.90.0`](https://npmjs.com/package/webpack/v/5.90.0)

### Breaking changes

-  `useSendMessage` hook is updated to support sending attachments with a message. To reduce complexity, the `useSendFiles` hook is being deprecated. The hook will be removed on or after 2026-04-03
-  `styleOptions.uploadThumbnailHeight` and `styleOptions.uploadThumbnailWidth` must be a `number` of pixels
-  `useSuggestedActions` type is updated to align with its actual implementation, by [@OEvgeny](https://github.com/OEvgeny), in PR [#5122](https://github.com/microsoft/BotFramework-WebChat/pull/5122)
-  Removed deprecated code: `connect*`, `useRenderActivity`, `useRenderActivityStatus`, `useRenderAvatar`, in PR [#5148](https://github.com/microsoft/BotFramework-WebChat/pull/5148), by [@compulim](https://github.com/compulim)
-  Added named exports in both CommonJS and ES Modules module format, in PR [#5148](https://github.com/microsoft/BotFramework-WebChat/pull/5148), by [@compulim](https://github.com/compulim)
-  Removed deprecated `useFocusSendBox()` hook, please use `useFocus('sendBox')` instead, in PR [#5150](https://github.com/microsoft/BotFramework-WebChat/pull/5150), by [@OEvgeny](https://github.com/OEvgeny)
-  HTML-in-Markdown is now supported. To disable this feature, set `styleOptions.markdownRenderHTML` to `false`

### Added

-  Resolves [#5083](https://github.com/microsoft/BotFramework-WebChat/issues/5083). Added `sendAttachmentOn` style option to send attachments and text in a single activity, by [@ms-jb](https://github.com/ms-jb) and [@compulim](https://github.com/compulim), in PR [#5123](https://github.com/microsoft/BotFramework-WebChat/pull/5123)
   -  `useSendMessage` hook is updated to support sending attachments with a message
   -  `useSendBoxAttachments` hook is added to get/set attachments in the send box
-  Resolves [#5081](https://github.com/microsoft/BotFramework-WebChat/issues/5081). Added `uploadAccept` and `uploadMultiple` style options, by [@ms-jb](https://github.com/ms-jb), in PR [#5048](https://github.com/microsoft/BotFramework-WebChat/pull/5048)
-  Added `sendBoxMiddleware` and `sendBoxToolbarMiddleware`, by [@compulim](https://github.com/compulim), in PR [#5120](https://github.com/microsoft/BotFramework-WebChat/pull/5120)
-  (Experimental) Added `botframework-webchat-fluent-theme` package for applying Fluent UI theme to Web Chat, by [@compulim](https://github.com/compulim) and [@OEvgeny](https://github.com/OEvgeny)
   -  Initial commit, in PR [#5120](https://github.com/microsoft/BotFramework-WebChat/pull/5120)
   -  Inherits Fluent CSS palette if available, in PR [#5122](https://github.com/microsoft/BotFramework-WebChat/pull/5122)
   -  New send box with Fluent look-and-feel, in PR [#5122](https://github.com/microsoft/BotFramework-WebChat/pull/5122)
      -  `styleOptions.maxMessageLength` to specify maximum length of the outgoing message
   -  Drag-and-drop file support, in PR [#5122](https://github.com/microsoft/BotFramework-WebChat/pull/5122)
   -  Added telephone keypad (DTMF keypad), in PR [#5122](https://github.com/microsoft/BotFramework-WebChat/pull/5122)
   -  Fixed `botframework-webchat-fluent-theme/package.json` to export `*.d.[m]ts` and default exports, in PR [#5131](https://github.com/microsoft/BotFramework-WebChat/pull/5131)
   -  Added support of `styleOptions.hideUploadButton`, in PR [#5132](https://github.com/microsoft/BotFramework-WebChat/pull/5132)
   -  Added `styleOptions.hideTelephoneKeypadButton` and default to `true`, in PR [#5132](https://github.com/microsoft/BotFramework-WebChat/pull/5132)
   -  Fit-and-finish on suggested actions and telephone keypad, in PR [#5132](https://github.com/microsoft/BotFramework-WebChat/pull/5132)
   -  Fixed to keep telephone keypad on-screen on click, in PR [#5132](https://github.com/microsoft/BotFramework-WebChat/pull/5132)
   -  Disabled send button and hid message length when telephone keypad is shown, in PR [#5136](https://github.com/microsoft/BotFramework-WebChat/pull/5136)
   -  Added dark theme support, in PR [#5138](https://github.com/microsoft/BotFramework-WebChat/pull/5138)
   -  Added an information message to the telephone keypad, in PR [#5140](https://github.com/microsoft/BotFramework-WebChat/pull/5140)
   -  Added animation to focus indicator and pixel-perfected, in PR [#5143](https://github.com/microsoft/BotFramework-WebChat/pull/5143)
   -  Integrated focus management for send box, in PR [#5150](https://github.com/microsoft/BotFramework-WebChat/pull/5150), by [@OEvgeny](https://github.com/OEvgeny)
   -  Added keyboard navigation support into suggested actions, in PR [#5154](https://github.com/microsoft/BotFramework-WebChat/pull/5154), by [@OEvgeny](https://github.com/OEvgeny)
   -  Fixes [#5166](https://github.com/microsoft/BotFramework-WebChat/issues/5166). Fixed "attach file" button in iOS Safari should looks the same as on other platforms, in PR [#5167](https://github.com/microsoft/BotFramework-WebChat/pull/5167), by [@compulim](https://github.com/compulim)
-  (Experimental) Added `<LocalizeString />` component which can be used to localize strings, by [@OEvgeny](https://github.com/OEvgeny) in PR [#5140](https://github.com/microsoft/BotFramework-WebChat/pull/5140)
-  Added `<ThemeProvider>` component to apply theme pack to Web Chat, by [@compulim](https://github.com/compulim), in PR [#5120](https://github.com/microsoft/BotFramework-WebChat/pull/5120)
-  Added `useMakeThumbnail` hook option to create a thumbnail from the file given, by [@compulim](https://github.com/compulim), in PR [#5123](https://github.com/microsoft/BotFramework-WebChat/pull/5123) and [#5122](https://github.com/microsoft/BotFramework-WebChat/pull/5122)
-  Added `moduleFormat` and `transpiler` build info to `<meta>` tag, in PR [#5148](https://github.com/microsoft/BotFramework-WebChat/pull/5148), by [@compulim](https://github.com/compulim)
-  Added support of rendering HTML-in-Markdown, in PR [#5161](https://github.com/microsoft/BotFramework-WebChat/pull/5161) and PR [#5164](https://github.com/microsoft/BotFramework-WebChat/pull/5164), by [@compulim](https://github.com/compulim), [@beyackle2](https://github.com/beyackle2), and [@OEvgeny](https://github.com/OEvgeny)

### Fixed

-  Fixes [#5050](https://github.com/microsoft/BotFramework-WebChat/issues/5050). Fixed focus should not blur briefly after tapping on a suggested action, by [@compulim](https://github.com/compulim), in PR [#5097](https://github.com/microsoft/BotFramework-WebChat/issues/pull/5097)
-  Fixes [#5111](https://github.com/microsoft/BotFramework-WebChat/issues/5111). Fixed keyboard help screen to use HTML description list, by [@compulim](https://github.com/compulim), in PR [#5116](https://github.com/microsoft/BotFramework-WebChat/issues/pull/5116)
-  Fixes [#5080](https://github.com/microsoft/BotFramework-WebChat/issues/5080). Fixed `dateToLocaleISOString` for handling sub-hour, by [@marclundgren](https://github.com/marclundgren), in PR [#5114](https://github.com/microsoft/BotFramework-WebChat/pull/5114)
-  Fixes [#5146](https://github.com/microsoft/BotFramework-WebChat/issues/5146). Fixed chat history focus indicator should not show up on tap, by [@OEvgeny](https://github.com/OEvgeny), in PR [#5145](https://github.com/microsoft/BotFramework-WebChat/pull/5145)
-  Fixes type portability issues by exporting types from all exported code, in PR [#5148](https://github.com/microsoft/BotFramework-WebChat/pull/5148), by [@compulim](https://github.com/compulim)
-  Fixes missing exports of `useNotifications`, in PR [#5148](https://github.com/microsoft/BotFramework-WebChat/pull/5148), by [@compulim](https://github.com/compulim)
-  Fixes suggested actions keyboard navigation skips actions after suggested actions got updated, in PR [#5150](https://github.com/microsoft/BotFramework-WebChat/pull/5150), by [@OEvgeny](https://github.com/OEvgeny)
-  Fixes [#5155](https://github.com/microsoft/BotFramework-WebChat/issues/5155). Fixed "Super constructor null of anonymous class is not a constructor" error in CDN bundle by bumping to [`webpack@5.91.0`](https://www.npmjs.com/package/webpack/v/5.91.0), in PR [#5156](https://github.com/microsoft/BotFramework-WebChat/pull/5156), by [@compulim](https://github.com/compulim)
-  Improved performance for `useActivityWithRenderer`, in PR [#5172](https://github.com/microsoft/BotFramework-WebChat/pull/5172), by [@OEvgeny](https://github.com/OEvgeny)

### Changed

-  Moved pull request validation pipeline to GitHub Actions, by [@compulim](https://github.com/compulim), in PR [#4976](https://github.com/microsoft/BotFramework-WebChat/pull/4976)
-  Bumped all dependencies to the latest versions, by [@compulim](https://github.com/compulim) in PR [#4973](https://github.com/microsoft/BotFramework-WebChat/pull/4973), PR [#5115](https://github.com/microsoft/BotFramework-WebChat/pull/5115), PR [#5148](https://github.com/microsoft/BotFramework-WebChat/pull/5148), and PR [#5156](https://github.com/microsoft/BotFramework-WebChat/pull/5156)
   -  Notes: Some components/features in Adaptive Cards are in preview and not ready for production use. Web Chat does not support these components and features
   -  Production dependencies
      -  [`adaptivecards@3.0.2`](https://npmjs.com/package/adaptivecards)
      -  [`core-js@3.33.3`](https://npmjs.com/package/core-js)
      -  [`jwt-decode@4.0.0`](https://npmjs.com/package/jwt-decode)
      -  [`markdown-it@13.0.2`](https://npmjs.com/package/markdown-it)
      -  [`markdown-it-for-inline@2.0.1`](https://npmjs.com/package/markdown-it-for-inline)
      -  [`merge-refs@1.2.2`](https://npmjs.com/package/merge-refs)
      -  [`mime@4.0.0`](https://npmjs.com/package/mime)
      -  [`redux@5.0.0`](https://npmjs.com/package/redux)
      -  [`url-search-params-polyfill@8.2.5`](https://npmjs.com/package/url-search-params-polyfill)
      -  [`use-ref-from@0.0.3`](https://npmjs.com/package/use-ref-from)
      -  [`whatwg-fetch@3.6.19`](https://npmjs.com/package/whatwg-fetch)
   -  Development dependencies
      -  [`@types/dom-speech-recognition@0.0.4`](https://npmjs.com/package/@types/dom-speech-recognition)
      -  [`@types/node@20.10.3`](https://npmjs.com/package/@types/node)
      -  [`@types/react@16.14.60`](https://npmjs.com/package/@types/react)
      -  [`@typescript-eslint/eslint-plugin@6.13.2`](https://npmjs.com/package/@typescript-eslint/eslint-plugin)
      -  [`@typescript-eslint/parser@6.13.2`](https://npmjs.com/package/@typescript-eslint/parser)
      -  [`axe-core@4.8.2`](https://npmjs.com/package/axe-core)
      -  [`babel-jest@29.7.0`](https://npmjs.com/package/babel-jest)
      -  [`concurrently@8.2.2`](https://npmjs.com/package/concurrently)
      -  [`esbuild@0.19.8`](https://npmjs.com/package/esbuild)
      -  [`eslint-config-prettier@9.1.0`](https://npmjs.com/package/eslint-config-prettier)
      -  [`eslint-plugin-import@2.29.0`](https://npmjs.com/package/eslint-plugin-import)
      -  [`eslint-plugin-prettier@5.0.1`](https://npmjs.com/package/eslint-plugin-prettier)
      -  [`eslint@8.55.0`](https://npmjs.com/package/eslint)
      -  [`istanbul-lib-coverage@3.2.2`](https://npmjs.com/package/istanbul-lib-coverage)
      -  [`jest-image-snapshot@6.3.0`](https://npmjs.com/package/jest-image-snapshot)
      -  [`jest@29.7.0`](https://npmjs.com/package/jest)
      -  [`lint-staged@15.2.0`](https://npmjs.com/package/lint-staged)
      -  [`nodemon@3.0.2`](https://npmjs.com/package/nodemon)
      -  [`prettier@3.1.0`](https://npmjs.com/package/prettier)
      -  [`read-pkg-up@11.0.0`](https://npmjs.com/package/read-pkg-up)
      -  [`read-pkg@9.0.1`](https://npmjs.com/package/read-pkg)
      -  [`selenium-webdriver@4.15.0`](https://npmjs.com/package/selenium-webdriver)
      -  [`typescript@5.3.2`](https://npmjs.com/package/typescript)
      -  [`webpack@5.91.0`](https://npmjs.com/package/webpack)

## [4.16.0] - 2023-11-16

### Breaking changes

-  Starting from 4.16.0, Internet Explorer is no longer supported
   -  After more than a year of the Internet Explorer 11 officially retirement, we decided to stop supporting Internet Explorer. This will help us to bring new features to Web Chat
   -  4.15.9 is the last version which supports Internet Explorer in limited fashion
-  `useTextBoxValue` setter will no longer replace emoticon with emoji, in PR [#4861](https://github.com/microsoft/BotFramework-WebChat/issues/pull/4861)

### Fixed

-  Fixes [#4865](https://github.com/microsoft/BotFramework-WebChat/issues/4865). Fixed <kbd>CTRL</kbd> + <kbd>Z</kbd> should undo correctly, by [@compulim](https://github.com/compulim), in PR [#4861](https://github.com/microsoft/BotFramework-WebChat/issues/pull/4861)
-  Fixes [#4863](https://github.com/microsoft/BotFramework-WebChat/issues/4863). Disable dark theme for link references until chat history has dark theme support, by [@compulim](https://github.com/compulim), in PR [#4864](https://github.com/microsoft/BotFramework-WebChat/pull/4864)
-  Fixes [#4866](https://github.com/microsoft/BotFramework-WebChat/issues/4866). Citation modal show fill screen width on mobile device and various fit-and-finish, by [@compulim](https://github.com/compulim), in PR [#4867](https://github.com/microsoft/BotFramework-WebChat/pull/4867)
-  Fixes [#4878](https://github.com/microsoft/BotFramework-WebChat/issues/4878). `createStore` should return type of `Redux.Store`, by [@compulim](https://github.com/compulim), in PR [#4877](https://github.com/microsoft/BotFramework-WebChat/pull/4877)
-  Fixes [#4957](https://github.com/microsoft/BotFramework-WebChat/issues/4957). Native chevron of the accordion in citation should be hidden, by [@compulim](https://github.com/compulim), in PR [#4958](https://github.com/microsoft/BotFramework-WebChat/pull/4958)
-  Fixes [#4870](https://github.com/microsoft/BotFramework-WebChat/issues/4870). Originator should use `claimInterpreter` instead of `ReplyAction/provider`, by [@compulim](https://github.com/compulim), in PR [#4910](https://github.com/microsoft/BotFramework-WebChat/pull/4910)

### Added

-  Resolves [#4853](https://github.com/microsoft/BotFramework-WebChat/issues/4853). Shorten URLs in link definitions UI, by [@compulim](https://github.com/compulim), in PR [#4860](https://github.com/microsoft/BotFramework-WebChat/pull/4860)
-  Resolves [#4840](https://github.com/microsoft/BotFramework-WebChat/issues/4840). Added feedback buttons in activity status, by [@compulim](https://github.com/compulim), in PR [#4846](https://github.com/microsoft/BotFramework-WebChat/pull/4846)
-  Resolves [#4841](https://github.com/microsoft/BotFramework-WebChat/issues/4841). Added link definitions UI in Markdown, by [@compulim](https://github.com/compulim), in PR [#4846](https://github.com/microsoft/BotFramework-WebChat/pull/4846)
-  Resolves [#4842](https://github.com/microsoft/BotFramework-WebChat/issues/4842). Added provenance in activity status, by [@compulim](https://github.com/compulim), in PR [#4846](https://github.com/microsoft/BotFramework-WebChat/pull/4846)
-  Resolves [#4856](https://github.com/microsoft/BotFramework-WebChat/issues/4856). Added types for `useStyleSet`, by [@compulim](https://github.com/compulim), in PR [#4857](https://github.com/microsoft/BotFramework-WebChat/pull/4857)

### Changed

-  Fixed [#4875](https://github.com/microsoft/BotFramework-WebChat/issues/4875). Replaced [`mdast`](https://npmjs.com/package/mdast/) with [`@types/mdast`](https://npmjs.com/package/@types/mdast/), by [@compulim](https://github.com/compulim), in PR [#4882](https://github.com/microsoft/BotFramework-WebChat/pull/4882)

## [4.15.9] - 2023-08-25

### Fixed

-  Fixes [#4718](https://github.com/microsoft/BotFramework-WebChat/issues/4718). In high contrast mode, Adaptive Card buttons, when pushed, should highlighted properly, by [@compulim](https://github.com/compulim), in PR [#4746](https://github.com/microsoft/BotFramework-WebChat/pull/4746)
-  Fixes [#4721](https://github.com/microsoft/BotFramework-WebChat/issues/4721) and [#4726](https://github.com/microsoft/BotFramework-WebChat/issues/4726). Adaptive Cards `TextBlock` heading elements should start at level 2, by [@compulim](https://github.com/compulim), in PR [#4747](https://github.com/microsoft/BotFramework-WebChat/issues/4747)
-  Fixes [#3699](https://github.com/microsoft/BotFramework-WebChat/issues/3699). Correcting timestamp roundoff, by [@compulim](https://github.com/compulim), in PR [#4821](https://github.com/microsoft/BotFramework-WebChat/pull/4821)
-  Fixes [#4849](https://github.com/microsoft/BotFramework-WebChat/issues/4849). Rendering an erroneous Adaptive Cards should bail out and not throw `MutationObserver` error, by [@compulim](https://github.com/compulim), in PR [#4852](https://github.com/microsoft/BotFramework-WebChat/issues/4852)

### Changed

-  Bumped all dependencies to the latest versions, by [@compulim](https://github.com/compulim) in PR [#4843](https://github.com/microsoft/BotFramework-WebChat/pull/4843)
   -  Production dependencies
      -  [`@emotion/css@11.11.2`](https://npmjs.com/package/@emotion/css)
      -  [`classnames@2.3.2`](https://npmjs.com/package/classnames)
      -  [`core-js@3.32.1`](https://npmjs.com/package/core-js)
      -  [`redux-saga@1.2.3`](https://npmjs.com/package/redux-saga)
      -  [`sanitize-html@2.11.0`](https://npmjs.com/package/sanitize-html)
      -  [`use-ref-from@0.0.2`](https://npmjs.com/package/use-ref-from)
      -  [`whatwg-fetch@3.6.18`](https://npmjs.com/package/whatwg-fetch)
   -  Development dependencies
      -  [`@types/node@20.5.8`](https://npmjs.com/package/@types/node)
      -  [`@types/react@18.2.21`](https://npmjs.com/package/@types/react)
      -  [`@typescript-eslint/eslint-plugin@6.5.0`](https://npmjs.com/package/@typescript-eslint/eslint-plugin)
      -  [`@typescript-eslint/parser@6.5.0`](https://npmjs.com/package/@typescript-eslint/parser)
      -  [`axe-core@4.7.2`](https://npmjs.com/package/axe-core)
      -  [`babel-jest@29.6.4`](https://npmjs.com/package/babel-jest)
      -  [`babel-loader@9.1.3`](https://npmjs.com/package/babel-loader)
      -  [`chalk@5.3.0`](https://npmjs.com/package/chalk)
      -  [`concurrently@8.2.1`](https://npmjs.com/package/concurrently)
      -  [`dotenv@16.3.1`](https://npmjs.com/package/dotenv)
      -  [`esbuild@0.19.2`](https://npmjs.com/package/esbuild)
      -  [`eslint-plugin-prettier@5.0.0`](https://npmjs.com/package/eslint-plugin-prettier)
      -  [`eslint-plugin-react@7.33.2`](https://npmjs.com/package/eslint-plugin-react)
      -  [`eslint@8.48.0`](https://npmjs.com/package/eslint)
      -  [`jest-image-snapshot@6.2.0`](https://npmjs.com/package/jest-image-snapshot)
      -  [`jest-junit@16.0.0`](https://npmjs.com/package/jest-junit)
      -  [`jest-trx-results-processor@3.0.2`](https://npmjs.com/package/jest-trx-results-processor)
      -  [`lerna@6.6.2`](https://npmjs.com/package/lerna)
      -  [`lint-staged@14.0.1`](https://npmjs.com/package/lint-staged)
      -  [`node-fetch@2.7.0`](https://npmjs.com/package/node-fetch)
      -  [`nodemon@3.0.1`](https://npmjs.com/package/nodemon)
      -  [`nopt@7.2.0`](https://npmjs.com/package/nopt)
      -  [`prettier@3.0.3`](https://npmjs.com/package/prettier)
      -  [`read-pkg-up@10.1.0`](https://npmjs.com/package/read-pkg-up)
      -  [`read-pkg@8.1.0`](https://npmjs.com/package/read-pkg)
      -  [`selenium-webdriver@4.12.0`](https://npmjs.com/package/selenium-webdriver)
      -  [`serve@14.2.1`](https://npmjs.com/package/serve)
      -  [`terser-webpack-plugin@5.3.9`](https://npmjs.com/package/terser-webpack-plugin)
      -  [`typescript@5.2.2`](https://npmjs.com/package/typescript)
      -  [`url-search-params-polyfill@8.2.4`](https://npmjs.com/package/url-search-params-polyfill)
      -  [`webpack-cli@5.1.4`](https://npmjs.com/package/webpack-cli)
      -  [`webpack-stats-plugin@1.1.3`](https://npmjs.com/package/webpack-stats-plugin)
      -  [`webpack@5.88.2`](https://npmjs.com/package/webpack)

## [4.15.8] - 2023-06-06

### Breaking changes

-  When `activity.channelData['webchat:fallback-text']` is present but empty, it will no longer applies `aria-hidden` to the activity
   -  The activity will not be narrated through live region. However, when navigating the transcript, it will be narrated as empty
   -  To make an activity presentational or hide from screen reader, please use `activityMiddleware` to customize the rendering

### Added

-  Resolved [#4643](https://github.com/microsoft/BotFramework-WebChat/issues/4643). Decoupling `botframework-directlinejs` from business logic of Web Chat for better tree-shaking, by [@compulim](https://github.com/compulim), in PR [#4645](https://github.com/microsoft/BotFramework-WebChat/pull/4645) and PR [#4648](https://github.com/microsoft/BotFramework-WebChat/pull/4648)
-  Resolved [#4650](https://github.com/microsoft/BotFramework-WebChat/issues/4650). Added automated accessibility check using [`axe-core`](https://npmjs.com/package/axe-core)
   -  Add `axe-core` in end-to-end tests, by [@compulim](https://github.com/compulim), in PR [#4704](https://github.com/microsoft/BotFramework-WebChat/pull/4704)
   -  HTML test: using `<main>` for the root container, by [@compulim](https://github.com/compulim), in PR [#4684](https://github.com/microsoft/BotFramework-WebChat/pull/4684) and PR [#4704](https://github.com/microsoft/BotFramework-WebChat/pull/4704)
   -  HTML test: changed contrast ratio in tests that use different background colors, by [@compulim](https://github.com/compulim), in PR [#4686](https://github.com/microsoft/BotFramework-WebChat/pull/4686) and PR [#4704](https://github.com/microsoft/BotFramework-WebChat/pull/4704)
   -  Added `ponyfill` prop to `<ReactWebChat>`/`<Composer>` and `createStoreWithOptions`, by [@compulim](https://github.com/compulim), in PR [#4662](https://github.com/microsoft/BotFramework-WebChat/pull/4662)
      -  This is for development scenarios where fake timer is needed and will only applies to Web Chat only
   -  HTML test: fix accessibility issues on HTML file, by [@compulim](https://github.com/compulim), in PR [#4685](https://github.com/microsoft/BotFramework-WebChat/pull/4685)
   -  HTML test: ensure all images has alternate text, by [@compulim](https://github.com/compulim), in PR [#4704](https://github.com/microsoft/BotFramework-WebChat/pull/4704)
   -  Adaptive Cards: always set `role` attribute, by [@compulim](https://github.com/compulim), in PR [#4704](https://github.com/microsoft/BotFramework-WebChat/pull/4704)
   -  Adaptive Cards: update host config to use lighter color for disabled inputs, by [@compulim](https://github.com/compulim), in PR [#4704](https://github.com/microsoft/BotFramework-WebChat/pull/4704)
   -  Keyboard help screen: remove `<header>` container, by [@compulim](https://github.com/compulim), in PR [#4704](https://github.com/microsoft/BotFramework-WebChat/pull/4704)
   -  Live region: added `<label>` for input fields in Adaptive Cards, by [@compulim](https://github.com/compulim), in PR [#4704](https://github.com/microsoft/BotFramework-WebChat/pull/4704)

### Fixed

-  Fixes [#4557](https://github.com/microsoft/BotFramework-WebChat/issues/4557). Flipper buttons in carousels and suggested actions is now renamed to "next/previous" from "left/right", by [@compulim](https://github.com/compulim), in PR [#4646](https://github.com/microsoft/BotFramework-WebChat/pull/4646)
-  Fixes [#4652](https://github.com/microsoft/BotFramework-WebChat/issues/4652). Keyboard help screen, activity focus traps, and chat history terminator should not be hidden behind `aria-hidden` because they are focusable, by [@compulim](https://github.com/compulim), in PR [#4659](https://github.com/microsoft/BotFramework-WebChat/pull/4659)
-  Fixes [#4665](https://github.com/microsoft/BotFramework-WebChat/issues/4665). Updated development server with latest ESBuild API, by [@compulim](https://github.com/compulim), in PR [#4662](https://github.com/microsoft/BotFramework-WebChat/pull/4662).
-  Fixes [#4706](https://github.com/microsoft/BotFramework-WebChat/issues/4706). Send button and <kbd>ENTER</kbd> key should function after reconnected, by [@compulim](https://github.com/compulim), in PR [#4707](https://github.com/microsoft/BotFramework-WebChat/pull/4707).
-  Fixes [#4708](https://github.com/microsoft/BotFramework-WebChat/issues/4708). Should function properly in browsers without `setImmediate` or without passing `store` prop, by [@compulim](https://github.com/compulim), in PR [#4709](https://github.com/microsoft/BotFramework-WebChat/pull/4709).

### Changed

-  Bumped all dependencies to the latest versions, by [@compulim](https://github.com/compulim) in PR [#4647](https://github.com/microsoft/BotFramework-WebChat/pull/4647), PR [#4655](https://github.com/microsoft/BotFramework-WebChat/pull/4655), and PR [#4737](https://github.com/microsoft/BotFramework-WebChat/pull/4737)
   -  Production dependencies
      -  [`@emotion/css@11.10.6`](https://npmjs.com/package/@emotion/css)
      -  [`botframework-directlinejs@0.15.4`](https://npmjs.com/package/botframework-directlinejs)
      -  [`core-js@3.28.0`](https://npmjs.com/package/core-js)
      -  [`markdown-it-attrs@4.1.6`](https://npmjs.com/package/markdown-it-attrs)
      -  [`react-redux@7.2.9`](https://npmjs.com/package/react-redux)
      -  [`redux-saga@1.2.2`](https://npmjs.com/package/redux-saga)
      -  [`redux@4.2.1`](https://npmjs.com/package/redux)
      -  [`sanitize-html@2.10.0`](https://npmjs.com/package/sanitize-html)
   -  Development dependencies
      -  [`@types/node@18.14.1`](https://npmjs.com/package/@types/node)
      -  [`@types/react@18.0.28`](https://npmjs.com/package/@types/react)
      -  [`@typescript-eslint/eslint-plugin@5.53.0`](https://npmjs.com/package/@typescript-eslint/eslint-plugin)
      -  [`@typescript-eslint/parser@5.53.0`](https://npmjs.com/package/@typescript-eslint/parser)
      -  [`adm-zip@0.5.10`](https://npmjs.com/package/adm-zip)
      -  [`babel-jest@29.4.3`](https://npmjs.com/package/babel-jest)
      -  [`babel-loader@9.1.2`](https://npmjs.com/package/babel-loader)
      -  [`chalk@5.2.0`](https://npmjs.com/package/chalk)
      -  [`concurrently@7.6.0`](https://npmjs.com/package/concurrently)
      -  [`core-js@3.28.0`](https://npmjs.com/package/core-js)
      -  [`dotenv@16.0.3`](https://npmjs.com/package/dotenv)
      -  [`esbuild@0.17.10`](https://npmjs.com/package/esbuild)
      -  [`eslint-config-prettier@8.6.0`](https://npmjs.com/package/eslint-config-prettier)
      -  [`eslint-plugin-react@7.32.2`](https://npmjs.com/package/eslint-plugin-react)
      -  [`eslint-plugin-security@1.7.1`](https://npmjs.com/package/eslint-plugin-security)
      -  [`eslint@8.34.0`](https://npmjs.com/package/eslint)
      -  [`express@4.18.2`](https://npmjs.com/package/express)
      -  [`glob@8.1.0`](https://npmjs.com/package/glob)
      -  [`http-proxy-middleware@2.0.6`](https://npmjs.com/package/http-proxy-middleware)
      -  [`husky@8.0.3`](https://npmjs.com/package/husky)
      -  [`jest-image-snapshot@6.1.0`](https://npmjs.com/package/jest-image-snapshot)
      -  [`jest-junit@15.0.0`](https://npmjs.com/package/jest-junit)
      -  [`jest@29.4.3`](https://npmjs.com/package/jest)
      -  [`lerna@6.5.1`](https://npmjs.com/package/lerna)
      -  [`lint-staged@13.1.2`](https://npmjs.com/package/lint-staged)
      -  [`node-dev@8.0.0`](https://npmjs.com/package/node-dev)
      -  [`node-fetch@2.6.9`](https://npmjs.com/package/node-fetch)
      -  [`nopt@7.0.0`](https://npmjs.com/package/nopt)
      -  [`prettier@2.8.4`](https://npmjs.com/package/prettier)
      -  [`restify@11.1.0`](https://npmjs.com/package/restify)
      -  [`selenium-webdriver@4.8.1`](https://npmjs.com/package/selenium-webdriver)
      -  [`serve-handler@6.1.5`](https://npmjs.com/package/serve-handler)
      -  [`serve@14.2.0`](https://npmjs.com/package/serve)
      -  [`source-map-loader@4.0.1`](https://npmjs.com/package/source-map-loader)
      -  [`typescript@4.9.5`](https://npmjs.com/package/typescript)
      -  [`webpack-cli@5.0.1`](https://npmjs.com/package/webpack-cli)
      -  [`webpack-stats-plugin@1.1.1`](https://npmjs.com/package/webpack-stats-plugin)
      -  [`webpack@5.75.0`](https://npmjs.com/package/webpack)
   -  Sample dependencies
      -  [`@azure/storage-blob@12.13.0`](https://npmjs.com/package/@azure/storage-blob)
      -  [`@babel/cli@7.21.0`](https://npmjs.com/package/@babel/cli)
      -  [`@babel/core@7.21.0`](https://npmjs.com/package/@babel/core)
      -  [`@babel/preset-env@7.20.2`](https://npmjs.com/package/@babel/preset-env)
      -  [`@babel/preset-react@7.18.6`](https://npmjs.com/package/@babel/preset-react)
      -  [`botbuilder-dialogs@4.19.1`](https://npmjs.com/package/botbuilder-dialogs)
      -  [`botbuilder@4.19.1`](https://npmjs.com/package/botbuilder)
      -  [`classnames@2.3.2`](https://npmjs.com/package/classnames)
      -  [`dotenv@16.0.3`](https://npmjs.com/package/dotenv)
      -  [`eslint-config-standard@17.0.0`](https://npmjs.com/package/eslint-config-standard)
      -  [`eslint-plugin-import@2.27.5`](https://npmjs.com/package/eslint-plugin-import)
      -  [`http-proxy-middleware@2.0.6`](https://npmjs.com/package/http-proxy-middleware)
      -  [`node-dev@8.0.0`](https://npmjs.com/package/node-dev)
      -  [`node-fetch@2.6.9`](https://npmjs.com/package/node-fetch)
      -  [`nodemon@2.0.20`](https://npmjs.com/package/nodemon)
      -  [`react-dom@18.2.0`](https://npmjs.com/package/react-dom)
      -  [`react-redux@8.0.5`](https://npmjs.com/package/react-redux)
      -  [`react-scripts@5.0.1`](https://npmjs.com/package/react-scripts)
      -  [`react@18.2.0`](https://npmjs.com/package/react)
      -  [`redux@4.2.1`](https://npmjs.com/package/redux)
      -  [`restify@11.1.0`](https://npmjs.com/package/restify)
      -  [`uuid@9.0.0`](https://npmjs.com/package/uuid)
-  Bumped Docker containers, by [@compulim](https://github.com/compulim), in PR [#4654](https://github.com/microsoft/BotFramework-WebChat/pull/4654)
   -  [`selenium/hub:4.8.1`](https://hub.docker.com/layers/selenium/hub/4.8.1/images/sha256-c6a1763c95cd8071968f8fe47057d9712b79d1a793d57d49120df889ce6dcd9d)
   -  [`selenium/node-chrome:110.0`](https://hub.docker.com/layers/selenium/node-chrome/110.0/images/sha256-8dcf0e6b681b54436e0c1481da1fe302d7f609844f4a868b9331fa7f5eead349)

## [4.15.7] - 2023-02-15

### Added

-  Added function to emit status change telemetry event for activities, by [@Erli-ms](https://github.com/Erli-ms), in PR [#4631](https://github.com/microsoft/BotFramework-WebChat/pull/4631)
-  Added ability for developers to customize Web Chat by extending the default UI without having to re-implement existing components, by [@dawolff-ms](https://github.com/dawolff-ms), in PR [#4539](https://github.com/microsoft/BotFramework-WebChat/pull/4539)

### Fixed

-  Fixes [#4558](https://github.com/microsoft/BotFramework-WebChat/issues/4558). In high contrast mode, "Retry" link button should use link color as defined by [CSS System Colors](https://w3c.github.io/csswg-drafts/css-color/#css-system-colors), by [@beyackle2](https://github.com/beyackle2) in PR [#4537](https://github.com/microsoft/BotFramework-WebChat/pull/4537)
-  Fixes [#4566](https://github.com/microsoft/BotFramework-WebChat/issues/4566). For YouTube and Vimeo `<iframe>`, add `sandbox="allow-same-origin allow-scripts"`, by [@compulim](https://github.com/compulim) in PR [#4567](https://github.com/microsoft/BotFramework-WebChat/pull/4567)
-  Fixes [#4561](https://github.com/microsoft/BotFramework-WebChat/issues/4561). Header title of keyboard help dialog should be the `aria-labelledby` of the dialog and close button should be the first element of the header, by [@compulim](https://github.com/compulim) in PR [#4609](https://github.com/microsoft/BotFramework-WebChat/pull/4609)
-  Fixes [#4559](https://github.com/microsoft/BotFramework-WebChat/issues/4559). Keyboard help screen should be scrollable and its close button should appear correctly in light-themed high contrast mode, by [@compulim](https://github.com/compulim) in PR [#4619](https://github.com/microsoft/BotFramework-WebChat/pull/4619)
-  Fixes [#4623](https://github.com/microsoft/BotFramework-WebChat/issues/4623). Screen reader should read error when failed to send an empty message or offline, by [@compulim](https://github.com/compulim) in PR [#4637](https://github.com/microsoft/BotFramework-WebChat/pull/4637)

### Changed

-  Updated test harness to use [Selenium Hub 4.6.0](https://hub.docker.com/r/selenium/hub) and [Chrome 107](https://hub.docker.com/r/selenium/node-chrome), by [@compulim](https://github.com/compulim) in PR [#4540](https://github.com/microsoft/BotFramework-WebChat/pull/4540)

## [4.15.6] - 2022-12-01

### Fixed

-  Fixes [#4501](https://github.com/microsoft/BotFramework-WebChat/issues/4501). Outgoing activities restored from chat service should be marked as sent, by [@compulim](https://github.com/compulim) in PR [#4532](https://github.com/microsoft/BotFramework-WebChat/pull/4532)

### Changed

-  Fixes [#4523](https://github.com/microsoft/BotFramework-WebChat/issues/4523). Bumped Microsoft Cognitive Services Speech SDK to [`microsoft-cognitiveservices-speech-sdk@1.17.0`](https://npmjs.com/package/microsoft-cognitiveservices-speech-sdk), by [@compulim](https://github.com/compulim) in PR [#4533](https://github.com/microsoft/BotFramework-WebChat/pull/4533)
   -  Also bumped [`web-speech-cognitive-services@7.1.3`](https://npmjs.com/package/web-speech-cognitive-services)

## [4.15.5] - 2022-11-16

### Fixed

-  Card action image alt text should use `imageAltText` field and fallback to `text` field, by [@compulim](https://github.com/compulim) in PR [#4333](https://github.com/microsoft/BotFramework-WebChat/pull/4333)
-  Fixes [#4472](https://github.com/microsoft/BotFramework-WebChat/issues/4472). Removed `role` attributes for notification bar and use `<div>` instead of `<ul>`/`<li>`, by [@compulim](https://github.com/compulim) in PR [#4475](https://github.com/microsoft/BotFramework-WebChat/pull/4475)
-  Fixes [#4393](https://github.com/microsoft/BotFramework-WebChat/issues/4393). Renders `<section role="feed">` only if there are one or more activities contained within, by [@beyackle2](https://github.com/beyackle2) and [@compulim](https://github.com/compulim), in PR [#4420](https://github.com/microsoft/BotFramework-WebChat/pull/4420)
-  Fixes [#4473](https://github.com/microsoft/BotFramework-WebChat/issues/4473). Bumped `strip-ansi@6.0.1` for `test-harness` as `@^7` does not support CommonJS project, by [@compulim](https://github.com/compulim) in PR [#4474](https://github.com/microsoft/BotFramework-WebChat/pull/4474)
-  Fixes [#4476](https://github.com/microsoft/BotFramework-WebChat/issues/4476). When focus on the keyboard help screen, it should focus on the close button, by [@compulim](https://github.com/compulim) in PR [#4479](https://github.com/microsoft/BotFramework-WebChat/pull/4479)
-  Fixes [#4442](https://github.com/microsoft/BotFramework-WebChat/issues/4442). Change the keyboard help screen string "Leave message" to "Exit message", by [@compulim](https://github.com/compulim) in PR [#4479](https://github.com/microsoft/BotFramework-WebChat/pull/4479)

### Changed

-  Bumped Adaptive Cards to [`adaptivecards@2.11.1`](https://npmjs.com/package/adaptivecards), by [@compulim](https://github.com/compulim) in PR [#4424](https://github.com/microsoft/BotFramework-WebChat/pull/4424)
-  Bumped Microsoft Cognitive Services Speech SDK to [`microsoft-cognitiveservices-speech-sdk@1.23.0`](https://npmjs.com/package/microsoft-cognitiveservices-speech-sdk), by [@compulim](https://github.com/compulim) in PR [#4435](https://github.com/microsoft/BotFramework-WebChat/pull/4435)
   -  Also bumped [`web-speech-cognitive-services@7.1.2`](https://npmjs.com/package/web-speech-cognitive-services)
-  Bumped all dependencies to the latest versions, by [@compulim](https://github.com/compulim) in PR [#4423](https://github.com/microsoft/BotFramework-WebChat/pull/4423) and [#4435](https://github.com/microsoft/BotFramework-WebChat/pull/4435)
   -  Production dependencies
      -  [`@babel/runtime@7.19.0`](https://npmjs.com/package/@babel/runtime)
      -  [`classnames@2.3.2`](https://npmjs.com/package/classnames)
      -  [`core-js@3.25.3`](https://npmjs.com/package/core-js)
      -  [`redux-saga@1.2.1`](https://npmjs.com/package/redux-saga)
      -  [`sanitize-html@2.7.2`](https://npmjs.com/package/sanitize-html)
   -  Development dependencies
      -  [`@babel/core@7.19.1`](https://npmjs.com/package/@babel/core)
      -  [`@babel/plugin-transform-runtime@7.19.1`](https://npmjs.com/package/@babel/plugin-transform-runtime)
      -  [`@babel/plugin-transform-typescript@7.19.1`](https://npmjs.com/package/@babel/plugin-transform-typescript)
      -  [`@babel/preset-env@7.19.1`](https://npmjs.com/package/@babel/preset-env)
      -  [`@babel/runtime@7.19.0`](https://npmjs.com/package/@babel/runtime)
      -  [`@types/node@18.7.22`](https://npmjs.com/package/@types/node)
      -  [`@types/react@18.0.21`](https://npmjs.com/package/@types/react)
      -  [`@typescript-eslint/eslint-plugin@5.38.0`](https://npmjs.com/package/@typescript-eslint/eslint-plugin)
      -  [`@typescript-eslint/parser@5.38.0`](https://npmjs.com/package/@typescript-eslint/parser)
      -  [`babel-jest@29.0.3`](https://npmjs.com/package/babel-jest)
      -  [`concurrently@7.4.0`](https://npmjs.com/package/concurrently)
      -  [`core-js@3.25.3`](https://npmjs.com/package/core-js)
      -  [`dotenv@16.0.2`](https://npmjs.com/package/dotenv)
      -  [`esbuild@0.15.9`](https://npmjs.com/package/esbuild)
      -  [`eslint-plugin-react@7.31.8`](https://npmjs.com/package/eslint-plugin-react)
      -  [`eslint@8.24.0`](https://npmjs.com/package/eslint)
      -  [`jest-image-snapshot@5.2.0`](https://npmjs.com/package/jest-image-snapshot)
      -  [`jest-junit@14.0.1`](https://npmjs.com/package/jest-junit)
      -  [`jest@29.0.3`](https://npmjs.com/package/jest)
      -  [`lerna@5.5.2`](https://npmjs.com/package/lerna)
      -  [`nodemon@2.0.20`](https://npmjs.com/package/nodemon)
      -  [`terser-webpack-plugin@5.3.6`](https://npmjs.com/package/terser-webpack-plugin)
      -  [`typescript@4.8.3`](https://npmjs.com/package/typescript)
      -  [`webpack-stats-plugin@1.1.0`](https://npmjs.com/package/webpack-stats-plugin)

## [4.15.4] - 2022-09-15

### Fixed

-  Fixes [#4403](https://github.com/microsoft/BotFramework-WebChat/issues/4403). Patched Unicode CLDR database which caused file upload in Polish to appear blank, by [@compulim](https://github.com/compulim), in PR [#4404](https://github.com/microsoft/BotFramework-WebChat/pull/4404)
-  Fixes [#4412](https://github.com/microsoft/BotFramework-WebChat/issues/4412). Fixed inconsistent in `packages/support/cldr-data/package.json`, by [@compulim](https://github.com/compulim), in PR [#4411](https://github.com/microsoft/BotFramework-WebChat/pull/4411)

### Changed

-  Bumped all dependencies to the latest versions, by [@compulim](https://github.com/compulim) in PR [#4392](https://github.com/microsoft/BotFramework-WebChat/pull/4392)
   -  Production dependencies
      -  [`@babel/runtime@7.18.9`](https://npmjs.com/package/@babel/runtime)
      -  [`@emotion/css@11.10.0`](https://npmjs.com/package/@emotion/css)
      -  [`core-js@3.24.1`](https://npmjs.com/package/core-js)
      -  [`markdown-it-attrs@4.1.4`](https://npmjs.com/package/markdown-it-attrs)
      -  [`markdown-it@13.0.1`](https://npmjs.com/package/markdown-it)
      -  [`redux@4.2.0`](https://npmjs.com/package/redux)
      -  [`sanitize-html@2.7.1`](https://npmjs.com/package/sanitize-html)
   -  Development dependencies
      -  [`@babel/cli@7.18.10`](https://npmjs.com/package/@babel/cli)
      -  [`@babel/core@7.18.10`](https://npmjs.com/package/@babel/core)
      -  [`@babel/plugin-proposal-class-properties@7.18.6`](https://npmjs.com/package/@babel/plugin-proposal-class-properties)
      -  [`@babel/plugin-proposal-object-rest-spread@7.18.9`](https://npmjs.com/package/@babel/plugin-proposal-object-rest-spread)
      -  [`@babel/plugin-transform-runtime@7.18.10`](https://npmjs.com/package/@babel/plugin-transform-runtime)
      -  [`@babel/plugin-transform-typescript@7.18.12`](https://npmjs.com/package/@babel/plugin-transform-typescript)
      -  [`@babel/preset-env@7.18.10`](https://npmjs.com/package/@babel/preset-env)
      -  [`@babel/preset-react@7.18.6`](https://npmjs.com/package/@babel/preset-react)
      -  [`@babel/preset-typescript@7.18.6`](https://npmjs.com/package/@babel/preset-typescript)
      -  [`@babel/runtime@7.18.9`](https://npmjs.com/package/@babel/runtime)
      -  [`@emotion/react@11.10.0`](https://npmjs.com/package/@emotion/react)
      -  [`@fluentui/react@8.87.1`](https://npmjs.com/package/@fluentui/react)
      -  [`@types/node@18.7.1`](https://npmjs.com/package/@types/node)
      -  [`@types/react@18.0.17`](https://npmjs.com/package/@types/react)
      -  [`@typescript-eslint/eslint-plugin@5.33.0`](https://npmjs.com/package/@typescript-eslint/eslint-plugin)
      -  [`@typescript-eslint/parser@5.33.0`](https://npmjs.com/package/@typescript-eslint/parser)
      -  [`babel-jest@28.1.3`](https://npmjs.com/package/babel-jest)
      -  [`babel-loader@8.2.5`](https://npmjs.com/package/babel-loader)
      -  [`babel-plugin-transform-inline-environment-variables@0.4.4`](https://npmjs.com/package/babel-plugin-transform-inline-environment-variables)
      -  [`concurrently@7.3.0`](https://npmjs.com/package/concurrently)
      -  [`core-js@3.24.1`](https://npmjs.com/package/core-js)
      -  [`dotenv@16.0.1`](https://npmjs.com/package/dotenv)
      -  [`error-stack-parser@2.1.4`](https://npmjs.com/package/error-stack-parser)
      -  [`esbuild@0.15.1`](https://npmjs.com/package/esbuild)
      -  [`eslint-plugin-prettier@4.2.1`](https://npmjs.com/package/eslint-plugin-prettier)
      -  [`eslint-plugin-react-hooks@4.6.0`](https://npmjs.com/package/eslint-plugin-react-hooks)
      -  [`eslint-plugin-react@7.30.1`](https://npmjs.com/package/eslint-plugin-react)
      -  [`eslint-plugin-security@1.5.0`](https://npmjs.com/package/eslint-plugin-security)
      -  [`eslint@8.21.0`](https://npmjs.com/package/eslint)
      -  [`express@4.18.1`](https://npmjs.com/package/express)
      -  [`http-proxy-middleware@2.0.6`](https://npmjs.com/package/http-proxy-middleware)
      -  [`husky@8.0.1`](https://npmjs.com/package/husky)
      -  [`jest-environment-node@28.1.3`](https://npmjs.com/package/jest-environment-node)
      -  [`jest-image-snapshot@5.1.0`](https://npmjs.com/package/jest-image-snapshot)
      -  [`jest-junit@14.0.0`](https://npmjs.com/package/jest-junit)
      -  [`jest-trx-results-processor@3.0.1`](https://npmjs.com/package/jest-trx-results-processor)
      -  [`jest@28.1.3`](https://npmjs.com/package/jest)
      -  [`lerna@5.4.0`](https://npmjs.com/package/lerna)
      -  [`lint-staged@13.0.3`](https://npmjs.com/package/lint-staged)
      -  [`node-dev@7.4.3`](https://npmjs.com/package/node-dev)
      -  [`nodemon@2.0.19`](https://npmjs.com/package/nodemon)
      -  [`nopt@6.0.0`](https://npmjs.com/package/nopt)
      -  [`prettier@2.7.1`](https://npmjs.com/package/prettier)
      -  [`react-scripts@5.0.1`](https://npmjs.com/package/react-scripts)
      -  [`selenium-webdriver@4.4.0`](https://npmjs.com/package/selenium-webdriver)
      -  [`serve@14.0.1`](https://npmjs.com/package/serve)
      -  [`source-map-loader@4.0.0`](https://npmjs.com/package/source-map-loader)
      -  [`strip-ansi@7.0.1`](https://npmjs.com/package/strip-ansi)
      -  [`terser-webpack-plugin@5.3.3`](https://npmjs.com/package/terser-webpack-plugin)
      -  [`typescript@4.7.4`](https://npmjs.com/package/typescript)
      -  [`webpack-cli@4.10.0`](https://npmjs.com/package/webpack-cli)
      -  [`webpack@5.74.0`](https://npmjs.com/package/webpack)

## [4.15.3] - 2022-08-10

### Breaking changes

-  Suggested actions is now a [`role="toolbar"`](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) and adopted roving tab index
   -  <kbd>TAB</kbd> key will now land on the container, instead of individual button
   -  While the focus is on the container, <kbd>LEFT</kbd>/<kbd>RIGHT</kbd> arrow keys are used to select different buttons (<kbd>UP</kbd>/<kbd>DOWN</kbd> for stacked layout)
   -  Visual focus indicator is now two tiered. The default styling is same as the one we use in chat history
      -  New style options added `suggestedActionsVisualKeyboardIndicatorColor`, `suggestedActionsVisualKeyboardIndicatorStyle`, `suggestedActionsVisualKeyboardIndicatorWidth`
   -  Suggested actions container will be unmounted when there are no suggested action button to display
   -  Suggested actions container is not longer a live region. The suggested action buttons will now be narrated by the chat history live region
-  Published NPM packages will now include `/dist`, `/lib`, and `/src` folders
   -  The `/dist` folder was previously missing from our NPM packages
-  The `activity.channelData.state` property is being deprecated in favor of the updated [`activity.channelData['webchat:send-status']`](https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/core/src/types/WebChatActivity.ts) property. Main differences include:
   -  Previously, we would set the `state` property to `"send failed"` when the chat adapter failed to send the activity, or after passing a timeout as defined in `styleOptions.sendTimeout`
   -  The new `'webchat:send-status'` property will be set to `"send failed"` when the chat adapter fails to send the activity or after passing a hardcoded timeout of 5 minutes
   -  See PR [#4362](https://github.com/microsoft/BotFramework-WebChat/pull/4362) for details

### Changed

-  Resolves [#4301](https://github.com/microsoft/BotFramework-WebChat/issues/4301). Updated `Dockerfile` to support secure container supply chain, by [@compulim](https://github.com/compulim) in PR [#4303](https://github.com/microsoft/BotFramework-WebChat/pull/4303)
-  Resolves [#4317](https://github.com/microsoft/BotFramework-WebChat/issues/4317). Updated `package.json` to allowlist `/dist`, `/lib`, `/src`, by [@compulim](https://github.com/compulim) in PR [#4318](https://github.com/microsoft/BotFramework-WebChat/pull/4318)
-  Resolves [#4322](https://github.com/microsoft/BotFramework-WebChat/issues/4322). Improved error messages for sending activities, by [@compulim](https://github.com/compulim) in PR [#4362](https://github.com/microsoft/BotFramework-WebChat/pull/4362)
-  Resolves [#4211](https://github.com/microsoft/BotFramework-WebChat/issues/4211). Added new `useSendStatusByActivityKey` hook to check the UI send status of an outgoing activity, by [@compulim](https://github.com/compulim) in PR [#4362](https://github.com/microsoft/BotFramework-WebChat/pull/4362)
   -  The send status returned by this hook is designed to display different UIs that reflect the "sending", "send failed" or "sent" status of the activity
   -  When modifying `styleOptions.sendTimeout` prop, the send status returned by this hook may transition from `"send failed"` to `"sending"`, and vice versa
   -  This is different from the send status provided by the chat adapter, namely `activity.channelData['webchat:send-status']`

### Fixed

-  Fixes [#4293](https://github.com/microsoft/BotFramework-WebChat/issues/4293) and [#4296](https://github.com/microsoft/BotFramework-WebChat/issues/4296). Fixed accessibility issues for suggested actions, by [@compulim](https://github.com/compulim), in PR [#4314](https://github.com/microsoft/BotFramework-WebChat/pull/4314)
   -  Centralized live region of suggested actions into chat history live region for better live region control
   -  Suggested actions container is now a `role="toolbar"` and uses roving tab index for multiple suggested action
-  Fixes [#4319](https://github.com/microsoft/BotFramework-WebChat/issues/4319). Fixed navigation keys not working in suggested actions under IE Mode, by [@compulim](https://github.com/compulim), in PR [#4320](https://github.com/microsoft/BotFramework-WebChat/pull/4320)
-  Fixes [#4315](https://github.com/microsoft/BotFramework-WebChat/issues/4315). Cleaned up localization strings for suggested actions, by [@compulim](https://github.com/compulim), in PR [#4323](https://github.com/microsoft/BotFramework-WebChat/issues/4323)
-  Fixes [#4294](https://github.com/microsoft/BotFramework-WebChat/issues/4294). Screen reader should not read message twice when navigating in the chat history, by [@compulim](https://github.com/compulim), in PR [#4323](https://github.com/microsoft/BotFramework-WebChat/issues/4323)
-  Fixes [#4295](https://github.com/microsoft/BotFramework-WebChat/issues/4295). Screen reader should not read suggested actions twice when message arrive in live region, by [@compulim](https://github.com/compulim), in PR [#4323](https://github.com/microsoft/BotFramework-WebChat/issues/4323)
-  Fixes [#4325](https://github.com/microsoft/BotFramework-WebChat/issues/4325). `aria-keyshortcuts` should use modifier keys according to `KeyboardEvent` key values spec, by [@compulim](https://github.com/compulim), in PR [#4323](https://github.com/microsoft/BotFramework-WebChat/issues/4323)
-  Fixes [#4327](https://github.com/microsoft/BotFramework-WebChat/issues/4327). In Adaptive Cards, `TextBlock` with `style="heading"` should have `aria-level` set, by [@compulim](https://github.com/compulim), in PR [#4329](https://github.com/microsoft/BotFramework-WebChat/issues/4329)
-  Fixes [#3949](https://github.com/microsoft/BotFramework-WebChat/issues/3949). For accessibility reasons, buttons in Adaptive Cards should be `role="button"` instead of `role="menubar"`/`role="menuitem"`, by [@compulim](https://github.com/compulim), in PR [#4263](https://github.com/microsoft/BotFramework-WebChat/issues/4263)
-  Fixes [#4211](https://github.com/microsoft/BotFramework-WebChat/issues/4211). Screen reader should read when an activity was failed to send, by [@compulim](https://github.com/compulim), in PR [#4362](https://github.com/microsoft/BotFramework-WebChat/pull/4362), also fixed:
   -  The "send failed" status on the activity should show up as soon as the chat adapter failed to send the activity
-  Fixes [#4312](https://github.com/microsoft/BotFramework-WebChat/issues/4312). `groupActivityMiddleware` returning invalid value should not throw exceptions, by [@compulim](https://github.com/compulim), in PR [#4378](https://github.com/microsoft/BotFramework-WebChat/pull/4378).
-  Fixes [#4386](https://github.com/microsoft/BotFramework-WebChat/issues/4386). Clicking on Adaptive Cards should not throw exception under IE11, by [@compulim](https://github.com/compulim), in PR [#4387](https://github.com/microsoft/BotFramework-WebChat/pull/4387), also fixed:
   -  Prop type warning should not be shown for `<ActivityRow>`

## Changes

-  Resolves [#4316](https://github.com/microsoft/BotFramework-WebChat/issues/4316). Using [ESBuild](https://esbuild.github.io/) as development server, by [@compulim](https://github.com/compulim), in PR [#4330](https://github.com/microsoft/BotFramework-WebChat/issues/4330)

### Samples

-  Added [`01.getting-started/l.sharepoint-web-part`](../../samples/01.getting-started/l.sharepoint-web-part) for hosting Web Chat as a SharePoint web part, in PR [#4385](https://github.com/microsoft/BotFramework-WebChat/pull/4385), by [@compulim](https://github.com/compulim)

## [4.15.2] - 2022-05-09

### Breaking changes

-  A new `type WebChatActivity` is introduced in the `botframework-webchat-core` package
   -  If you are previously using the `type DirectLineActivity`, you may need to move to this new type
   -  All Web Chat APIs will use the newer `type WebChatActivity`
   -  The new `type WebChatActivity` is a well-defined type for handling activities inside Web Chat
   -  The existing `type DirectLineActivity` will be used solely for communicating with `type DirectLineJSBotConnection`, a.k.a. `botframework-directlinejs` package

### Fixed

-  Fixes [#4102](https://github.com/microsoft/BotFramework-WebChat/issues/4102). Fixed `cldr-data-downloader` package not working properly on Windows, by [@compulim](https://github.com/compulim) in PR [#4223](https://github.com/microsoft/BotFramework-WebChat/pull/4223)
-  Fixes [#4232](https://github.com/microsoft/BotFramework-WebChat/issues/4232). Added `blob:` to allowed protocol list for file attachment UI (`<FileContent>`), by [@compulim](https://github.com/compulim) in PR [#4233](https://github.com/microsoft/BotFramework-WebChat/pull/4233)
-  Fixes [#4204](https://github.com/microsoft/BotFramework-WebChat/issues/4204). Sort using `activity.channelData['webchat:sequence-id']` and fallback to epoch time of `activity.timestamp`, by [@compulim](https://github.com/compulim), in PR [#4203](https://github.com/microsoft/BotFramework-WebChat/pull/4203)
-  Fixes [#4264](https://github.com/microsoft/BotFramework-WebChat/issues/4264). Fixed focus trap should leave when the activity no longer contains any tabbable elements (including elements with `aria-disabled="true"`), by [@compulim](https://github.com/compulim) in PR [#4265](https://github.com/microsoft/BotFramework-WebChat/pull/4265)

### Added

-  Resolves [#4099](https://github.com/microsoft/BotFramework-WebChat/issues/4099), added typing indicator to live region for screen reader, by [@compulim](https://github.com/compulim), in PR [#4210](https://github.com/microsoft/BotFramework-WebChat/pull/4210)

### Changed

-  Bumped all dependencies to the latest versions, by [@compulim](https://github.com/compulim) in PR [#4195](https://github.com/microsoft/BotFramework-WebChat/pull/4195) and PR [#4230](https://github.com/microsoft/BotFramework-WebChat/pull/4230)
   -  Production dependencies
      -  [`@babel/runtime@7.17.2`](https://npmjs.com/package/@babel/runtime)
      -  [`@emotion/css@11.7.1`](https://npmjs.com/package/@emotion/css)
      -  [`base64-arraybuffer@1.0.2`](https://npmjs.com/package/base64-arraybuffer)
      -  [`core-js@3.21.1`](https://npmjs.com/package/core-js)
      -  [`globalize@1.7.0`](https://npmjs.com/package/globalize)
      -  [`markdown-it-attrs@4.1.3`](https://npmjs.com/package/markdown-it-attrs)
      -  [`memoize-one@6.0.0`](https://npmjs.com/package/memoize-one)
      -  [`mime@3.0.0`](https://npmjs.com/package/mime)
      -  [`prop-types@15.8.1`](https://npmjs.com/package/prop-types)
      -  [`react-redux@7.2.8`](https://npmjs.com/package/react-redux)
      -  [`redux@4.1.2`](https://npmjs.com/package/redux)
      -  [`sanitize-html@2.7.0`](https://npmjs.com/package/sanitize-html)
   -  Development dependencies
      -  [`@babel/cli@7.17.6`](https://npmjs.com/package/@babel/cli)
      -  [`@babel/core@7.17.5`](https://npmjs.com/package/@babel/core)
      -  [`@babel/plugin-proposal-class-properties@7.16.7`](https://npmjs.com/package/@babel/plugin-proposal-class-properties)
      -  [`@babel/plugin-proposal-object-rest-spread@7.17.3`](https://npmjs.com/package/@babel/plugin-proposal-object-rest-spread)
      -  [`@babel/plugin-transform-runtime@7.17.0`](https://npmjs.com/package/@babel/plugin-transform-runtime)
      -  [`@babel/preset-env@7.16.11`](https://npmjs.com/package/@babel/preset-env)
      -  [`@babel/preset-react@7.16.7`](https://npmjs.com/package/@babel/preset-react)
      -  [`@babel/preset-typescript@7.16.7`](https://npmjs.com/package/@babel/preset-typescript)
      -  [`@babel/runtime@7.17.2`](https://npmjs.com/package/@babel/runtime)
      -  [`@emotion/react@11.8.1`](https://npmjs.com/package/@emotion/react)
      -  [`@fluentui/react@8.57.0`](https://npmjs.com/package/@fluentui/react)
      -  [`@types/node@17.0.21`](https://npmjs.com/package/@types/node)
      -  [`@types/react-dom@16.8.5`](https://npmjs.com/package/@types/react-dom)
      -  [`@types/react@17.0.39`](https://npmjs.com/package/@types/react)
      -  [`@typescript-eslint/eslint-plugin@5.13.0`](https://npmjs.com/package/@typescript-eslint/eslint-plugin)
      -  [`@typescript-eslint/parser@5.13.0`](https://npmjs.com/package/@typescript-eslint/parser)
      -  [`adm-zip@0.5.9`](https://npmjs.com/package/adm-zip)
      -  [`babel-jest@27.5.1`](https://npmjs.com/package/babel-jest)
      -  [`babel-loader@8.2.3`](https://npmjs.com/package/babel-loader)
      -  [`babel-plugin-istanbul@6.1.1`](https://npmjs.com/package/babel-plugin-istanbul)
      -  [`base64-arraybuffer@1.0.2`](https://npmjs.com/package/base64-arraybuffer)
      -  [`botframework-directlinejs@0.15.1`](https://npmjs.com/package/botframework-directlinejs)
      -  [`concurrently@7.0.0`](https://npmjs.com/package/concurrently)
      -  [`core-js@3.21.1`](https://npmjs.com/package/core-js)
      -  [`dotenv@16.0.0`](https://npmjs.com/package/dotenv)
      -  [`error-stack-parser@2.0.7`](https://npmjs.com/package/error-stack-parser)
      -  [`esbuild@0.14.24`](https://npmjs.com/package/esbuild)
      -  [`eslint-config-prettier@8.5.0`](https://npmjs.com/package/eslint-config-prettier)
      -  [`eslint-plugin-prettier@4.0.0`](https://npmjs.com/package/eslint-plugin-prettier)
      -  [`eslint-plugin-react-hooks@4.3.0`](https://npmjs.com/package/eslint-plugin-react-hooks)
      -  [`eslint-plugin-react@7.29.3`](https://npmjs.com/package/eslint-plugin-react)
      -  [`eslint@8.10.0`](https://npmjs.com/package/eslint)
      -  [`express@4.17.3`](https://npmjs.com/package/express)
      -  [`glob@7.2.0`](https://npmjs.com/package/glob)
      -  [`global-agent@3.0.0`](https://npmjs.com/package/global-agent)
      -  [`html-webpack-plugin@5.5.0`](https://npmsj.com/package/html-webpack-plugin)
      -  [`http-proxy-middleware@2.0.3`](https://npmjs.com/package/http-proxy-middleware)
      -  [`husky@7.0.4`](https://npmjs.com/package/husky)
      -  [`istanbul-lib-coverage@3.2.0`](https://npmjs.com/package/istanbul-lib-coverage)
      -  [`jest-environment-node@27.5.1`](https://npmjs.com/package/jest-environment-node)
      -  [`jest-trx-results-processor@2.2.1`](https://npmjs.com/package/jest-trx-results-processor)
      -  [`jest@27.5.1`](https://npmjs.com/package/jest)
      -  [`lint-staged@12.3.4`](https://npmjs.com/package/lint-staged)
      -  [`memoize-one@6.0.0`](https://npmjs.com/package/memoize-one)
      -  [`node-dev@7.1.0`](https://npmjs.com/package/node-dev)
      -  [`nodemon@2.0.15`](https://npmjs.com/package/nodemon)
      -  [`prettier@2.5.1`](https://npmjs.com/package/prettier)
      -  [`prop-types@15.8.1`](https://npmjs.com/package/prop-types)
      -  [`read-pkg-up@9.1.0`](https://npmjs.com/package/read-pkg-up)
      -  [`read-pkg@7.1.0`](https://npmjs.com/package/read-pkg)
      -  [`restify@8.6.1`](https://npmjs.com/package/restify)
      -  [`selenium-webdriver@4.1.1`](https://npmjs.com/package/selenium-webdriver)
      -  [`source-map-loader@3.0.1`](https://npmjs.com/package/source-map-loader)
      -  [`terser-webpack-plugin@5.3.1`](https://npmjs.com/package/terser-webpack-plugin)
      -  [`typescript@4.6.2`](https://npmjs.com/package/typescript)
      -  [`webpack-cli@4.9.2`](https://npmjs.com/package/webpack-cli)
      -  [`webpack@5.70.0`](https://npmjs.com/package/webpack)

## [4.15.1] - 2022-03-04

### Fixed

-  Fixes [#4196](https://github.com/microsoft/BotFramework-WebChat/issues/4196). Should render/mount to a detached DOM node without errors, by [@compulim](https://github.com/compulim), in PR [#4197](https://github.com/microsoft/BotFramework-WebChat/pull/4197)

### Breaking changes

-  New [`Map` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) polyfill is required for IE11 when using NPM version of Web Chat:
   -  `Map` object polyfill is not required when using ES5 bundle of Web Chat from our CDN (`webchat-es5.js`)
   -  If you are seeing new errors while loading NPM version of Web Chat under IE11, please add a polyfill
   -  We recommend `core-js` package, it can be loaded by `import 'core-js/features/map'`
   -  Our current list of required polyfills can be found in [`packages/bundle/src/polyfill.ts`](https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/bundle/src/polyfill.ts)
-  Style options are introduced to send button for improved accessibility:
   -  `suggestedActionBackground` and `suggestedActionXXXBackground` are being deprecated in favor of `suggestedActionBackgroundColor` and `suggestedActionBackgroundColorOnXXX` respectively, for consistencies when porting to other platforms
   -  `suggestedActionDisabledXXX` is being renamed to `suggestedActionXXXOnDisabled`, for consistencies with other style options
   -  `suggestedActionXXXOnActive`, `suggestedActionXXXOnFocus`, `suggestedActionXXXOnHover` are introduced for styling per user gestures
   -  `suggestedActionKeyboardFocusIndicatorXXX` are introduced for styling the "focus ring" when [focused using a keyboard](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible)

### Added

-  Adds `eslint-plugin-security`, consolidate `.eslintrc.yml` at project root, and treat warnings as errors, by [@compulim](https://github.com/compulim), in PR [#4079](https://github.com/microsoft/BotFramework-WebChat/pull/4079)
-  Adds allowed protocol list to file attachment and OAuth card, by [@compulim](https://github.com/compulim), in PR [#4143](https://github.com/microsoft/BotFramework-WebChat/pull/4143)

### Fixed

-  Fixes [#4018](https://github.com/microsoft/BotFramework-WebChat/issues/4018). When using <kbd>TAB</kbd> or <kbd>SHIFT</kbd> + <kbd>TAB</kbd> key to focus on the transcript, it should select the last activity, by [@compulim](https://github.com/compulim), in PR [#4035](https://github.com/microsoft/BotFramework-WebChat/pull/4035)
-  Fixes [#4020](https://github.com/microsoft/BotFramework-WebChat/issues/4020). With or without scan mode turned on, screen reader users should be able to press <kbd>ENTER</kbd> to focus on interactive activity, by [@compulim](https://github.com/compulim), in PR [#4041](https://github.com/microsoft/BotFramework-WebChat/pull/4041)
-  Fixes [#4021](https://github.com/microsoft/BotFramework-WebChat/issues/4021). For screen reader usability, suggested actions container should not render "Is empty" alt text initially, by [@compulim](https://github.com/compulim), in PR [#4041](https://github.com/microsoft/BotFramework-WebChat/pull/4041)
-  Fixes [#4029](https://github.com/microsoft/BotFramework-WebChat/issues/4029). Added new keyboard focus indicator for suggested actions, by [@compulim](https://github.com/compulim), in PR [#4035](https://github.com/microsoft/BotFramework-WebChat/pull/4035)
   -  New style options are introduced: `suggestedActionXXXOnActive`, `suggestedActionXXXOnFocus`, `suggestedActionXXXOnHover`, `suggestedActionKeyboardFocusIndicatorXXX`
   -  Style options are renamed: `suggestedActionDisabledXXX` become `suggestedActionXXXOnDisabled`
-  Fixes [#4028](https://github.com/microsoft/BotFramework-WebChat/issues/4028). Added new keyboard focus indicator for send box buttons, by [@compulim](https://github.com/compulim), in PR [#4035](https://github.com/microsoft/BotFramework-WebChat/pull/4035)
   -  New style options are introduced: `sendBoxButtonXXXOnActive`, `sendBoxButtonXXXOnFocus`, `sendBoxButtonXXXOnHover`, `sendBoxButtonKeyboardFocusIndicatorXXX`
-  Fixes [#4015](https://github.com/microsoft/BotFramework-WebChat/issues/4015). Added `role="heading"` to titles of rich card, by [@compulim](https://github.com/compulim), in PR [#4074](https://github.com/microsoft/BotFramework-WebChat/pull/4074)
-  Fixes [#4081](https://github.com/microsoft/BotFramework-WebChat/issues/4081). Updated typing for `StyleOptions.suggestedActionsStackedOverflow`, by [@compulim](https://github.com/compulim), in PR [#4083](https://github.com/microsoft/BotFramework-WebChat/pull/4083)
-  Fixes [#4075](https://github.com/microsoft/BotFramework-WebChat/issues/4075). Added `box-sizing: border-box` to all descendants under Adaptive Cards, by [@compulim](https://github.com/compulim), in PR [#4084](https://github.com/microsoft/BotFramework-WebChat/pull/4084)
-  Fixes [#4104](https://github.com/microsoft/BotFramework-WebChat/issues/4104) and [#4105](https://github.com/microsoft/BotFramework-WebChat/issues/4105). Fixed invalid entry in `core/package-lock.json`, removed `playground/host`, and added script to rebase URLs in `package-lock.json`, by [@compulim](https://github.com/compulim), in PR [#4106](https://github.com/microsoft/BotFramework-WebChat/pull/4106)
-  Fixes [#3933](https://github.com/microsoft/BotFramework-WebChat/issues/3933), [#3934](https://github.com/microsoft/BotFramework-WebChat/issues/3934), [#3994](https://github.com/microsoft/BotFramework-WebChat/issues/3994) and [#4019](https://github.com/microsoft/BotFramework-WebChat/issues/4019), for various accessibility improvements, by [@compulim](https://github.com/compulim), in PR [#4108](https://github.com/microsoft/BotFramework-WebChat/pull/4108)
   -  Added a new keyboard help screen
   -  Reduce repetitions when reading message content and briefier readings
   -  Separated hints for links and interactive widgets
   -  Focus trap when focus is on interactive attachments or Adaptive Cards
   -  Using `role="feed"`/`role="article"` for chat history and its messages
   -  Always assign a message to `aria-activedescendant` for chat history
   -  Updated verbiage from "transcript" to "chat history"
   -  Fixed overlapping hit zone causing clicking on bottom edge of message bubble may focus on the next activity instead
   -  Fixed typings of `useFocus` and `useLocalizer`
-  Fixes [#3165](https://github.com/microsoft/BotFramework-WebChat/issues/3165) and [#4094](https://github.com/microsoft/BotFramework-WebChat/issues/4094). Allowlist `aria-label` for links in Markdown and skip unrecognized attributes or invalid curly brackets, by [@compulim](https://github.com/compulim), in PR [#4095](https://github.com/microsoft/BotFramework-WebChat/pull/4095)
-  Fixes [#4190](https://github.com/microsoft/BotFramework-WebChat/issues/4190). Recent Markdown curly bracket fix should not break IE11 due to unsupported "u" flag in `RegExp`, by [@compulim](https://github.com/compulim), in PR [#4191](https://github.com/microsoft/BotFramework-WebChat/pull/4191)

### Changed

-  Bumped all dependencies to the latest versions, by [@compulim](https://github.com/compulim) in PR [#4074](https://github.com/microsoft/BotFramework-WebChat/pull/4074) and PR [#4123](https://github.com/microsoft/BotFramework-WebChat/pull/4123)
   -  Production dependencies
      -  [`@babel/runtime@7.15.4`](https://npmjs.com/package/@babel/runtime)
      -  [`adaptivecards@2.10.0`](https://npmjs.com/package/adaptivecards)
      -  [`base64-arraybuffer@1.0.1`](https://npmjs.com/package/base64-arraybuffer)
      -  [`botframework-directlinejs@0.15.1`](https://npmjs.com/package/botframework-directlinejs)
      -  [`core-js@3.18.3`](https://npmjs.com/package/core-js)
      -  [`markdown-it@12.3.2`](https://npmjs.com/package/markdown-it)
      -  [`markdown-it-attrs-es5@2.0.1`](https://npmjs.com/package/markdown-it-attrs-es5)
      -  [`react-film@3.1.0`](https://npmjs.com/package/react-film)
      -  [`react-say@2.1.0`](https://npmjs.com/package/react-say)
      -  [`react-scroll-to-bottom@4.2.0`](https://npmjs.com/package/react-scroll-to-bottom)
   -  Development dependencies
      -  [`@babel/cli@7.15.7`](https://npmjs.com/package/@babel/cli)
      -  [`@babel/core@7.15.8`](https://npmjs.com/package/@babel/core)
      -  [`@babel/plugin-proposal-object-rest-spread@7.15.6`](https://npmjs.com/package/@babel/plugin-proposal-object-rest-spread)
      -  [`@babel/plugin-transform-runtime@7.15.8`](https://npmjs.com/package/@babel/plugin-transform-runtime)
      -  [`@babel/preset-env@7.15.8`](https://npmjs.com/package/@babel/preset-env)
      -  [`@babel/preset-typescript@7.15.0`](https://npmjs.com/package/@babel/preset-typescript)
      -  [`@types/node@16.10.9`](https://npmjs.com/package/@types/node)
      -  [`@types/react@17.0.29`](https://npmjs.com/package/@types/react)
      -  [`@typescript-eslint/eslint-plugin@4.33.0`](https://npmjs.com/package/@typescript-eslint/eslint-plugin)
      -  [`@typescript-eslint/parser@4.33.0`](https://npmjs.com/package/@typescript-eslint/parser)
      -  [`babel-jest@27.2.5`](https://npmjs.com/package/babel-jest)
      -  [`botbuilder@4.15.0`](https://npmjs.com/package/botbuilder)
      -  [`concurrently@6.3.0`](https://npmjs.com/package/concurrently)
      -  [`core-js@3.18.3`](https://npmjs.com/package/core-js)
      -  [`esbuild@0.12.29`](https://npmjs.com/package/esbuild)
      -  [`eslint-plugin-prettier@3.4.1`](https://npmjs.com/package/eslint-plugin-prettier)
      -  [`eslint-plugin-react@7.26.1`](https://npmjs.com/package/eslint-plugin-react)
      -  [`eslint@7.32.0`](https://npmjs.com/package/eslint)
      -  [`istanbul-lib-coverage@3.0.2`](https://npmjs.com/package/istanbul-lib-coverage)
      -  [`jest-environment-node@27.2.5`](https://npmjs.com/package/jest-environment-node)
      -  [`jest-junit@13.0.0`](https://npmjs.com/package/jest-junit)
      -  [`jest@27.2.5`](https://npmjs.com/package/jest)
      -  [`node-dev@7.1.0`](https://npmjs.com/package/node-dev)
      -  [`node-fetch@2.6.7`](https://npmjs.com/package/node-fetch)
      -  [`prettier@2.4.1`](https://npmjs.com/package/prettier)
      -  [`react-scripts@5.0.0`](https://npmjs.com/package/react-scripts)
      -  [`restify@8.6.0`](https://npmjs.com/package/restify)
      -  [`selenium-webdriver@4.0.0`](https://npmjs.com/package/selenium-webdriver)
      -  [`serve@13.0.2`](https://npmjs.com/package/serve)
      -  [`strip-ansi@6.0.1`](https://npmjs.com/package/strip-ansi)
      -  [`terser-webpack-plugin@5.2.4`](https://npmjs.com/package/terser-webpack-plugin)
      -  [`webpack-cli@4.9.0`](https://npmjs.com/package/webpack-cli)
      -  [`webpack@5.58.2`](https://npmjs.com/package/webpack)

### Samples

-  Fixes [#4031](https://github.com/microsoft/BotFramework-WebChat/issues/4031). Updated [`05.custom-components/b.send-typing-indicator`](../../samples/05.custom-components/b.send-typing-indicator) to reply with `message` activity, instead of `typing` activity, in PR [#4063](https://github.com/microsoft/BotFramework-WebChat/pull/4063), by [@compulim](https://github.com/compulim)

## [4.14.2] - 2022-09-06

### Fixed

-  QFE: Fixes [#4403](https://github.com/microsoft/BotFramework-WebChat/issues/4403). Patched Unicode CLDR database which caused file upload in Polish to appear blank, by [@compulim](https://github.com/compulim), in PR [#4406](https://github.com/microsoft/BotFramework-WebChat/pull/4406)

## [4.14.1] - 2021-09-07

### Fixed

-  Fixes [#3968](https://github.com/microsoft/BotFramework-WebChat/issues/3968). Fix typing for `usePerformCardAction` hook, by [@compulim](https://github.com/compulim), in PR [#3969](https://github.com/microsoft/BotFramework-WebChat/pull/3969)

### Changed

-  Resolves [#4017](https://github.com/microsoft/BotFramework-WebChat/issues/4017). In samples, moved [`react-scripts`](https://npmjs.com/package/react-scripts`) to `devDependencies`, in PR [#4023](https://github.com/microsoft/BotFramework-WebChat/pull/4023)
-  Forked [`cldr-data`](https://npmjs.com/package/cldr-data) and [`cldr-data-downloader`](https://npmjs.com/package/cldr-data-downloader), in PR [#3998](https://github.com/microsoft/BotFramework-WebChat/pull/3998)
   -  Moved source code to under `./src` folder
   -  Moved to `fs.readFileSync()` from `require()` when reading JSON files
   -  Moved to `node:fs.mkdir()` and removed `mkdirp`
   -  Moved tests from `node:assert` to Jest
   -  Updated Unicode CLDR download folder to `/dist/` folder from project root
   -  Moved from Grunt/JSHint to [`eslint`](https://npmjs.com/package/eslint)
   -  Upgraded from CommonJS to ES Module
   -  Use [`read-pkg-up`](https://npmjs.com/package/read-pkg-up) to determines parent `package.json`
      -  In Web Chat, since we use `lerna` to run the `install` script, we need to relax how `cldr-data` read from parent `package.json`
-  Updated peer dependency of `react` to `>= 16.8.6`, in PR [#3996](https://github.com/microsoft/BotFramework-WebChat/pull/3996)
-  Bumped all dependencies to the latest versions and sample bumps, by [@compulim](https://github.com/compulim) in PR [#3996](https://github.com/microsoft/BotFramework-WebChat/pull/3996), PR [#3998](https://github.com/microsoft/BotFramework-WebChat/pull/3998), and PR [#4023](https://github.com/microsoft/BotFramework-WebChat/pull/4023)
   -  Production dependencies
      -  [`@babel/runtime@7.14.6`](https://npmjs.com/package/@babel/runtime)
      -  [`abort-controller-es5@2.0.0`](https://npmjs.com/package/abort-controller-es5)
      -  [`botframework-directlinejs@0.15.0`](https://npmjs.com/package/botframework-directlinejs)
      -  [`core-js@3.15.2`](https://npmjs.com/package/core-js)
      -  [`event-target-shim@6.0.2`](https://npmjs.com/package/event-target-shim)
      -  [`markdown-it-attrs-es5@2.0.0`](https://npmjs.com/package/markdown-it-attrs-es5)
      -  [`markdown-it@12.1.0`](https://npmjs.com/package/markdown-it)
      -  [`memoize-one@5.2.1`](https://npmjs.com/package/memoize-one)
      -  [`p-defer-es5@2.0.0`](https://npmjs.com/package/p-defer-es5)
      -  [`p-defer@4.0.0`](https://npmjs.com/package/p-defer)
      -  [`react-redux@7.2.4`](https://npmjs.com/package/react-redux)
      -  [`web-speech-cognitive-services@7.1.1`](https://npmjs.com/package/web-speech-cognitive-services)
   -  Development dependencies
      -  [`@babel/cli@7.14.5`](https://npmjs.com/package/@babel/cli)
      -  [`@babel/core@7.14.6`](https://npmjs.com/package/@babel/core)
      -  [`@babel/plugin-proposal-class-properties@7.14.5`](https://npmjs.com/package/@babel/plugin-proposal-class-properties)
      -  [`@babel/plugin-proposal-object-rest-spread@7.14.7`](https://npmjs.com/package/@babel/plugin-proposal-object-rest-spread)
      -  [`@babel/plugin-transform-runtime@7.14.5`](https://npmjs.com/package/@babel/plugin-transform-runtime)
      -  [`@babel/preset-env@7.14.7`](https://npmjs.com/package/@babel/preset-env)
      -  [`@babel/preset-react@7.14.5`](https://npmjs.com/package/@babel/preset-react)
      -  [`@babel/preset-typescript@7.14.5`](https://npmjs.com/package/@babel/preset-typescript)
      -  [`@babel/runtime@7.14.6`](https://npmjs.com/package/@babel/runtime)
      -  [`@emotion/react@11.4.0`](https://npmjs.com/package/@emotion/react)
      -  [`@fluentui/react@8.22.3`](https://npmjs.com/package/@fluentui/react)
      -  [`@types/node@16.3.1`](https://npmjs.com/package/@types/node)
      -  [`@types/react-dom@17.0.9`](https://npmjs.com/package/@types/react-dom)
      -  [`@types/react@17.0.14`](https://npmjs.com/package/@types/react)
      -  [`@typescript-eslint/eslint-plugin@4.28.3`](https://npmjs.com/package/@typescript-eslint/eslint-plugin)
      -  [`@typescript-eslint/parser@4.28.3`](https://npmjs.com/package/@typescript-eslint/parser)
      -  [`babel-jest@27.0.6`](https://npmjs.com/package/babel-jest)
      -  [`concurrently@6.2.0`](https://npmjs.com/package/concurrently)
      -  [`core-js@3.15.2`](https://npmjs.com/package/core-js)
      -  [`dotenv@10.0.0`](https://npmjs.com/package/dotenv)
      -  [`esbuild@0.12.15`](https://npmjs.com/package/esbuild)
      -  [`eslint-plugin-prettier@3.4.0`](https://npmjs.com/package/eslint-plugin-prettier)
      -  [`eslint-plugin-react@7.24.0`](https://npmjs.com/package/eslint-plugin-react)
      -  [`eslint@7.30.0`](https://npmjs.com/package/eslint)
      -  [`http-proxy-middleware@2.0.1`](https://npmjs.com/package/http-proxy-middleware)
      -  [`husky@7.0.1`](https://npmjs.com/package/husky)
      -  [`jest-environment-node@27.0.6`](https://npmjs.com/package/jest-environment-node)
      -  [`jest-image-snapshot@4.5.1`](https://npmjs.com/package/jest-image-snapshot)
      -  [`jest-junit@12.2.0`](https://npmjs.com/package/jest-junit)
      -  [`jest@27.0.6`](https://npmjs.com/package/jest)
      -  [`lint-staged@11.0.0`](https://npmjs.com/package/lint-staged)
      -  [`node-dev@7.0.0`](https://npmjs.com/package/node-dev)
      -  [`nodemon@2.0.12`](https://npmjs.com/package/nodemon)
      -  [`p-defer@4.0.0`](https://npmjs.com/package/p-defer)
      -  [`prettier@2.3.2`](https://npmjs.com/package/prettier)
      -  [`sanitize-html@2.4.0`](https://npmjs.com/package/sanitize-html)
      -  [`selenium-webdriver@4.0.0-beta.4`](https://npmjs.com/package/selenium-webdriver)
      -  [`serve@12.0.0`](https://npmjs.com/package/serve)
      -  [`strip-ansi@6.0.0`](https://npmjs.com/package/strip-ansi)
      -  [`typescript@4.3.5`](https://npmjs.com/package/typescript)
      -  [`webpack@5.45.1`](https://npmjs.com/package/webpack)
   -  Dependencies used by samples
      -  [`@azure/storage-blob@12.7.0`](https://npmjs.com/package/@azure/storage-blob)
      -  [`base64-arraybuffer@1.0.1`](https://npmjs.com/package/base64-arraybuffer)
      -  [`http-proxy-middleware@1.3.1`](https://npmjs.com/package/http-proxy-middleware)
      -  [`restify@8.5.1`](https://npmjs.com/package/restify)

## [4.14.0] - 2021-07-09

### Breaking changes

-  A new style option `scrollToEndButtonBehavior` is introduced to control when the scroll to end button should show (formerly "new messages" button):
   -  `styleOptions.hideScrollToEndButton` has been deprecated. To hide the scroll to end button, set `styleOptions.scrollToEndButtonBehavior` to `false`;
   -  `styleOptions.newMessageButtonFontSize` has been renamed to `styleOptions.scrollToEndButtonFontSize` to better reflect its purpose.

### Added

-  Cleanup repo URLs to point to main branch, by [@corinagum](https://github.com/corinagum), in PR [#3870](https://github.com/microsoft/BotFramework-WebChat/pull/3870)
-  Resolves [#3557](https://github.com/microsoft/BotFramework-WebChat/issues/3557) and [#3736](https://github.com/microsoft/BotFramework-WebChat/issues/3736). Improved test harness and added browser pooling, by [@compulim](https://github.com/compulim), in PR [#3871](https://github.com/microsoft/BotFramework-WebChat/pull/3871)
-  Resolves [#3788](https://github.com/microsoft/BotFramework-WebChat/issues/3788). Added `localTimestamp` and `localTimezone` (if available) to all outgoing activities, by [@compulim](https://github.com/compulim), in PR [#3896](https://github.com/microsoft/BotFramework-WebChat/pull/3896)
-  Resolves [#3925](https://github.com/microsoft/BotFramework-WebChat/issues/3925). Added `scrollToEndButtonBehavior` to control when the scroll to end button should show, removed `hideScrollToEndButton`, and renamed `newMessagesButtonFontSize` to `scrollToEndButtonFontSize`, by [@compulim](https://github.com/compulim), in PR [#3926](https://github.com/microsoft/BotFramework-WebChat/issues/3926).
   -  Values for `scrollToEndButtonBehavior`:
      -  If unset, will maintain same behavior as previous versions, same as `"unread"`;
      -  `"unread"` will show when there are any unread and offscreen messages (default);
      -  `"any"` will show when there are any offscreen messages;
      -  `false` will always hide the button.
   -  Added new [`scrollToEndButtonMiddleware`](https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/api/src/types/scrollToEndButtonMiddleware.ts) to customize the appearance of the scroll to end button.
-  Resolves [#3752](https://github.com/microsoft/BotFramework-WebChat/issues/3752). Added typings (`*.d.ts`) for all public interfaces, by [@compulim](https://github.com/compulim), in PR [#3931](https://github.com/microsoft/BotFramework-WebChat/pull/3931) and [#3946](https://github.com/microsoft/BotFramework-WebChat/pull/3946)
-  Resolves [#2316](https://github.com/microsoft/BotFramework-WebChat/issues/2316). Added blessing/priming of `AudioContext` when clicking on microphone button, by [@compulim](https://github.com/compulim), in PR [#3974](https://github.com/microsoft/BotFramework-WebChat/pull/3974)

### Fixed

-  Fixes [#3810](https://github.com/microsoft/BotFramework-WebChat/issues/3810). Removes `aria-hidden` from elements that have a focusable child, by [@corinagum](https://github.com/corinagum) in PR [#3836](https://github.com/microsoft/BotFramework-WebChat/pull/3836)
-  Fixes [#3811](https://github.com/microsoft/BotFramework-WebChat/issues/3811). Removes erroneous `aria-labelledby` from carousel, by [@corinagum](https://github.com/corinagum) in PR [#3836](https://github.com/microsoft/BotFramework-WebChat/pull/3836)
-  Fixes [#3814](https://github.com/microsoft/BotFramework-WebChat/issues/3814). Allow carousel's scrollable content to be tabbable, by [@corinagum](https://github.com/corinagum) in PR [#3841](https://github.com/microsoft/BotFramework-WebChat/pull/3841)
-  Fixes [#3834](https://github.com/microsoft/BotFramework-WebChat/issues/3834). Ensure carousel attachments are read by AT on tab focus, by [@corinagum](https://github.com/corinagum) in PR [#3841](https://github.com/microsoft/BotFramework-WebChat/pull/3841)
-  Fixes [#3812](https://github.com/microsoft/BotFramework-WebChat/issues/3812). Update `adaptiveCardHostConfig` to accessible text color-contrasts, by [@corinagum](https://github.com/corinagum) in PR [#3853](https://github.com/microsoft/BotFramework-WebChat/pull/3853)
-  Fixes [#3816](https://github.com/microsoft/BotFramework-WebChat/issues/3816). De-bumped Node.js engine requirement for Direct Line Speech SDK to `>= 10.14.2` from `>= 12.0.0`, by [@compulim](https://github.com/compulim) in PR [#3854](https://github.com/microsoft/BotFramework-WebChat/pull/3854)
-  Fixes [#3842](https://github.com/microsoft/BotFramework-WebChat/issues/3842). Updated [`husky`](https://npmjs.com/package/husky), [`lint-staged`](https://npmjs.com/package/lint-staged) and corresponding `precommit` scripts, by [@compulim](https://github.com/compulim), in PR [#3871](https://github.com/microsoft/BotFramework-WebChat/pull/3871)
-  Improved test reliability and added snapshots to console of test harness in development mode, by [@compulim](https://github.com/compulim), in PR [#3891](https://github.com/microsoft/BotFramework-WebChat/pull/3891)
-  Fixes [#3757](https://github.com/microsoft/BotFramework-WebChat/issues/3757). IE11: Send box should not be disabled after pressing <kbd>ESCAPE</kbd> key in the transcript, by [@compulim](https://github.com/compulim), in PR [#3902](https://github.com/microsoft/BotFramework-WebChat/pull/3902)
-  Fixes [#3901](https://github.com/microsoft/BotFramework-WebChat/issues/3901). IE11: SVG icons for buttons should not be focusable, by [@compulim](https://github.com/compulim), in PR [#3902](https://github.com/microsoft/BotFramework-WebChat/pull/3902)
-  Fixes [#3825](https://github.com/microsoft/BotFramework-WebChat/issues/3825). Add `role="presentation"` to all decorative `<svg>`, by [@compulim](https://github.com/compulim), in PR [#3903](https://github.com/microsoft/BotFramework-WebChat/pull/3903)
-  Fixes [#3360](https://github.com/microsoft/BotFramework-WebChat/issues/3360) and [#3615](https://github.com/microsoft/BotFramework-WebChat/issues/3615). Use `channelData['webchat:fallback-text']` field for screen reader text, before stripping Markdown from [`activity.text` field](https://github.com/microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#text), by [@compulim](https://github.com/compulim), in PR [#3917](https://github.com/microsoft/BotFramework-WebChat/pull/3917)
-  Fixes [#3856](https://github.com/microsoft/BotFramework-WebChat/issues/3856). Fix missing typings, by [@compulim](https://github.com/compulim) and [@corinagum](https://github.com/corinagum), in PR [#3931](https://github.com/microsoft/BotFramework-WebChat/pull/3931)
-  Fixes [#3943](https://github.com/microsoft/BotFramework-WebChat/issues/3943). Auto-scroll should skip invisible activities, such as post back or event activity, by [@compulim](https://github.com/compulim), in PR [#3945](https://github.com/microsoft/BotFramework-WebChat/pull/3945)
-  Fixes [#3947](https://github.com/microsoft/BotFramework-WebChat/issues/3947). Adaptive Cards: all action sets (which has `role="menubar"`) must have at least 1 or more `role="menuitem"`, by [@compulim](https://github.com/compulim), in PR [#3950](https://github.com/microsoft/BotFramework-WebChat/pull/3950)
-  Fixes [#3823](https://github.com/microsoft/BotFramework-WebChat/issues/3823) and [#3899](https://github.com/microsoft/BotFramework-WebChat/issues/3899). Fix speech recognition and synthesis on Safari, by [@compulim](https://github.com/compulim), in PR [#3974](https://github.com/microsoft/BotFramework-WebChat/pull/3974)
-  Fixes [#3977](https://github.com/microsoft/BotFramework-WebChat/issues/3977). Fix bundle not work in Internet Explorer 11 due to `p-defer`, by [@compulim](https://github.com/compulim), in PR [#3978](https://github.com/microsoft/BotFramework-WebChat/pull/3978)
-  Fixes [#3979](https://github.com/microsoft/BotFramework-WebChat/issues/3979). Fix Direct Line Speech should work in environments without microphone access, by [@compulim](https://github.com/compulim), in PR [#3980](https://github.com/microsoft/BotFramework-WebChat/pull/3980)

### Changed

-  Bumped all dependencies to the latest versions and sample bumps, by [@compulim](https://github.com/compulim) in PR [#3831](https://github.com/microsoft/BotFramework-WebChat/pull/3831), PR [#3846](https://github.com/microsoft/BotFramework-WebChat/pull/3846), PR [#3917](https://github.com/microsoft/BotFramework-WebChat/pull/3917), PR [#3965](https://github.com/microsoft/BotFramework-WebChat/pull/3965), and PR [#3966](https://github.com/microsoft/BotFramework-WebChat/pull/3966)
   -  Development dependencies
      -  [`@azure/storage-blob@12.5.0`](https://npmjs.com/package/@azure/storage-blob)
      -  [`@babel/cli@7.13.14`](https://npmjs.com/package/@babel/cli)
      -  [`@babel/core@7.13.14`](https://npmjs.com/package/@babel/core)
      -  [`@babel/plugin-proposal-async-generator-functions@7.13.8`](https://npmjs.com/package/@babel/plugin-proposal-async-generator-functions)
      -  [`@babel/plugin-proposal-class-properties@7.13.0`](https://npmjs.com/package/@babel/plugin-proposal-class-properties)
      -  [`@babel/plugin-proposal-object-rest-spread@7.13.8`](https://npmjs.com/package/@babel/plugin-proposal-object-rest-spread)
      -  [`@babel/plugin-transform-runtime@7.13.10`](https://npmjs.com/package/@babel/plugin-transform-runtime)
      -  [`@babel/preset-env@7.13.12`](https://npmjs.com/package/@babel/preset-env)
      -  [`@babel/preset-react@7.13.13`](https://npmjs.com/package/@babel/preset-react)
      -  [`@babel/preset-typescript@7.13.0`](https://npmjs.com/package/@babel/preset-typescript)
      -  [`@babel/runtime@7.13.10`](https://npmjs.com/package/@babel/runtime)
      -  [`@babel/standalone@7.13.14`](https://npmjs.com/package/@babel/standalone)
      -  [`@fluentui/react@8.9.0`](https://npmjs.com/package/@fluentui/react)
      -  [`@types/node@14.14.37`](https://npmjs.com/package/@types/node)
      -  [`@types/react@17.0.3`](https://npmjs.com/package/@types/react)
      -  [`@typescript-eslint/eslint-plugin@4.21.0`](https://npmjs.com/package/@typescript-eslint/eslint-plugin)
      -  [`@typescript-eslint/parser@4.21.0`](https://npmjs.com/package/@typescript-eslint/parser)
      -  [`abort-controller-es5@1.2.0`](https://npmjs.com/package/abort-controller-es5)
      -  [`abort-controller@3.0.0`](https://npmjs.com/package/abort-controller)
      -  [`babel-loader@8.2.2`](https://npmjs.com/package/babel-loader)
      -  [`base64-arraybuffer@0.2.0`](https://npmjs.com/package/base64-arraybuffer)
      -  [`botbuilder-dialogs@4.12.0`](https://npmjs.com/package/botbuilder-dialogs)
      -  [`botbuilder@4.12.0`](https://npmjs.com/package/botbuilder)
      -  [`classnames@2.3.1`](https://npmjs.com/package/classnames)
      -  [`concurrently@6.0.1`](https://npmjs.com/package/concurrently)
      -  [`copy-webpack-plugin@6.4.1`](https://npmjs.com/package/copy-webpack-plugin)
      -  [`core-js@3.10.0`](https://npmjs.com/package/core-js)
      -  [`cross-env@7.0.3`](https://npmjs.com/package/cross-env)
      -  [`css-loader@5.2.0`](https://npmjs.com/package/css-loader)
      -  [`dotenv@8.2.0`](https://npmjs.com/package/dotenv)
      -  [`eslint-config-standard@16.0.2`](https://npmjs.com/package/eslint-config-standard)
      -  [`eslint-plugin-import@2.22.1`](https://npmjs.com/package/eslint-plugin-import)
      -  [`eslint-plugin-node@11.1.0`](https://npmjs.com/package/eslint-plugin-node)
      -  [`eslint-plugin-promise@4.3.1`](https://npmjs.com/package/eslint-plugin-promise)
      -  [`eslint-plugin-react@7.23.1`](https://npmjs.com/package/eslint-plugin-react)
      -  [`eslint-plugin-react@7.23.1`](https://npmjs.com/package/eslint-plugin-react)
      -  [`eslint-plugin-standard@5.0.0`](https://npmjs.com/package/eslint-plugin-standard)
      -  [`eslint@7.23.0`](https://npmjs.com/package/eslint)
      -  [`event-iterator@2.0.0`](https://npmjs.com/package/event-iterator)
      -  [`global-agent@2.2.0`](https://npmjs.com/package/global-agent)
      -  [`html-webpack-plugin@4.5.2`](https://npmjs.com/package/html-webpack-plugin)
      -  [`http-proxy-middleware@1.1.0`](https://npmjs.com/package/http-proxy-middleware)
      -  [`husky@6.0.0`](https://npmjs.com/package/husky)
      -  [`jest-image-snapshot@4.4.1`](https://npmjs.com/package/jest-image-snapshot)
      -  [`lerna@4.0.0`](https://npmjs.com/package/lerna)
      -  [`lint-staged@10.5.4`](https://npmjs.com/package/lint-staged)
      -  [`lolex@6.0.0`](https://npmjs.com/package/lolex)
      -  [`math-random@2.0.1`](https://npmjs.com/package/math-random)
      -  [`msal@1.4.9`](https://npmjs.com/package/msal)
      -  [`node-dev@6.6.0`](https://npmjs.com/package/node-dev)
      -  [`nodemon@2.0.7`](https://npmjs.com/package/nodemon)
      -  [`office-ui-fabric-react@7.165.2`](https://npmjs.com/package/office-ui-fabric-react)
      -  [`p-defer-es5@1.2.1`](https://npmjs.com/package/p-defer-es5)
      -  [`p-defer@3.0.0`](https://npmjs.com/package/p-defer)
      -  [`prettier@2.2.1`](https://npmjs.com/package/prettier)
      -  [`react-redux@7.2.3`](https://npmjs.com/package/react-redux)
      -  [`react-scripts@4.0.3`](https://npmjs.com/package/react-scripts)
      -  [`redux@4.0.5`](https://npmjs.com/package/redux)
      -  [`restify@8.5.1`](https://npmjs.com/package/restify)
      -  [`selenium-webdriver@4.0.0-beta.2`](https://npmjs.com/package/selenium-webdriver)
      -  [`simple-update-in@2.2.0`](https://npmjs.com/package/simple-update-in)
      -  [`source-map-loader@1.1.3`](https://npmjs.com/package/source-map-loader)
      -  [`string-similarity@4.0.4`](https://npmjs.com/package/string-similarity)
      -  [`style-loader@2.0.0`](https://npmjs.com/package/style-loader)
      -  [`uuid@8.3.2`](https://npmjs.com/package/uuid)
      -  [`webpack-cli@4.6.0`](https://npmjs.com/package/webpack-cli)
      -  [`webpack-stats-plugin@1.0.3`](https://npmjs.com/package/webpack-stats-plugin)
      -  [`webpack@4.46.0`](https://npmjs.com/package/webpack)
   -  Production dependencies
      -  [`@emotion/css@11.1.3`](https://npmjs.com/package/@emotion/css), moved from [`create-emotion`](https://npmjs.com/package/create-emotion)
      -  [`adaptivecards@2.9.0`](https://npmjs.com/package/adaptivecards)
      -  [`classnames@2.3.1`](https://npmjs.com/package/classnames)
      -  [`core-js@3.10.0`](https://npmjs.com/package/core-js)
      -  [`react-dictate-button@2.0.1`](https://npmjs.com/package/react-dictate-button)
      -  [`react-film@3.0.1`](https://npmjs.com/package/react-film)
      -  [`react-redux@7.2.3`](https://npmjs.com/package/react-redux)
      -  [`redux-devtools-extension@2.13.9`](https://npmjs.com/package/redux-devtools-extension)
      -  [`sanitize-html@1.27.5`](https://npmjs.com/package/sanitize-html)
      -  [`url-search-params-polyfill@8.1.1`](https://npmjs.com/package/url-search-params-polyfill)
      -  [`whatwg-fetch@3.6.2`](https://npmjs.com/package/whatwg-fetch)
-  Resolves [#3693](https://github.com/microsoft/BotFramework-WebChat/issues/3693). Bumped to [`microsoft-cognitiveservices-speech-sdk@1.17.0`](https://npmjs.com/package/microsoft-cognitiveservices-speech-sdk), by [@compulim](https://github.com/compulim), in PR [#3907](https://github.com/microsoft/BotFramework-WebChat/pull/3907)

## [4.13.0] - 2021-04-05

### Added

-  Resolves [#3087](https://github.com/microsoft/BotFramework-WebChat/issues/3087). External links in Markdown will now be appended with an "open in new window" icon and accessibility label, by [@compulim](https://github.com/compulim) in PR [#3817](https://github.com/microsoft/BotFramework-WebChat/pull/3817)
-  Resolves [#2100](https://github.com/microsoft/BotFramework-WebChat/issues/2100). Add types declarations for Style Options in api bundle, by [@corinagum](https://github.com/corinagum), in PR [#3818](https://github.com/microsoft/BotFramework-WebChat/pull/3818)

### Changed

-  Bumped all dependencies to the latest versions and sample bumps, by [@corinagum](https://github.com/corinagum) in PR [#3805](https://github.com/microsoft/BotFramework-WebChat/pull/3805)
   -  Development dependencies
      -  [`@babel/cli@7.13.10`](https://npmjs.com/package/@babel/cli)
      -  [`@babel/core@7.13.10`](https://npmjs.com/package/@babel/core)
      -  [`@babel/plugin-proposal-class-properties@7.13.0`](https://npmjs.com/package/@babel/plugin-proposal-class-properties)
      -  [`@babel/plugin-proposal-object-rest-spread@7.13.8`](https://npmjs.com/package/@babel/plugin-proposal-object-rest-spread)
      -  [`@babel/plugin-transform-runtime@7.13.10`](https://npmjs.com/package/@babel/plugin-transform-runtime)
      -  [`@babel/preset-env@7.13.10`](https://npmjs.com/package/@babel/preset-env)
      -  [`@babel/preset-react@7.12.13`](https://npmjs.com/package/@babel/preset-react)
      -  [`@babel/preset-typescript@7.13.0`](https://npmjs.com/package/@babel/preset-typescript)
      -  [`@babel/runtime@7.13.10`](https://npmjs.com/package/@babel/runtime)
      -  [`@types/node@14.14.35`](https://npmjs.com/package/@types/node)
      -  [`@types/react@16.9.55`](https://npmjs.com/package/@types/react)
      -  [`@typescript-eslint/eslint-plugin@4.18.0`](https://npmjs.com/package/@typescript-eslint/eslint-plugin)
      -  [`@typescript-eslint/parser@4.18.0`](https://npmjs.com/package/@typescript-eslint/parser)
      -  [`babel-jest@26.6.3`](https://npmjs.com/package/babel-jest)
      -  [`eslint-plugin-prettier@3.3.1`](https://npmjs.com/package/eslint-plugin-prettier)
      -  [`eslint-plugin-react-hooks@4.2.0`](https://npmjs.com/package/eslint-plugin-react-hooks)
      -  [`eslint-plugin-react@7.22.0`](https://npmjs.com/package/eslint-plugin-react)
      -  [`eslint@7.22.0`](https://npmjs.com/package/eslint)
      -  [`husky@4.3.0`](https://npmjs.com/package/husky)
      -  [`jest-image-snapshot@4.2.0`](https://npmjs.com/package/jest-image-snapshot)
      -  [`jest-junit@12.0.0`](https://npmjs.com/package/jest-junit)
      -  [`jest-trx-results-processor@2.2.0`](https://npmjs.com/package/jest-trx-results-processor)
      -  [`jest@26.6.3`](https://npmjs.com/package/jest)
      -  [`lint-staged@10.5.1`](https://npmjs.com/package/lint-staged)
      -  [`lolex@6.0.0`](https://npmjs.com/package/lolex)
      -  [`node-dev@6.4.0`](https://npmjs.com/package/node-dev)
      -  [`node-fetch@2.6.1`](https://npmjs.com/package/node-fetch)
      -  [`prettier@2.2.1`](https://npmjs.com/package/prettier)
      -  [`source-map-loader@1.1.2`](https://npmjs.com/package/source-map-loader)
      -  [`terser-webpack-plugin@4.2.3`](https://npmjs.com/package/terser-webpack-plugin)
      -  [`typescript@4.2.3`](https://npmjs.com/package/typescript)
      -  [`webpack-cli@4.2.0`](https://npmjs.com/package/webpack-cli)
      -  [`webpack-stats-plugin@1.0.2`](https://npmjs.com/package/webpack-stats-plugin)
      -  [`webpack@4.44.2`](https://npmjs.com/package/webpack)
   -  Production dependencies
      -  [`@babel/runtime@7.13.10`](https://npmjs.com/package/@babel/runtime)
      -  [`botframework-directlinejs@0.14.1`](https://npmjs.com/package/botframework-directlinejs)
      -  [`globalize@1.6.0`](https://npmjs.com/package/globalize)
      -  [`markdown-it@12.0.4`](https://npmjs.com/package/markdown-it)
      -  [`microsoft-cognitiveservices-speech-sdk@1.15.1`](https://npmjs.com/package/microsoft-cognitiveservices-speech-sdk)
      -  [`react-redux@7.2.2`](https://npmjs.com/package/react-redux)
      -  [`redux@4.0.5`](https://npmjs.com/package/redux)
      -  [`sanitize-html@2.1.2`](https://npmjs.com/package/sanitize-html)
      -  [`web-speech-cognitive-services@7.1.0`](https://npmjs.com/package/web-speech-cognitive-services)
      -  [`whatwg-fetch@3.4.1`](https://npmjs.com/package/whatwg-fetch)

### Samples

-  Fixes [#3632](https://github.com/microsoft/BotFramework-WebChat/issues/3632). Fixed typo in reaction button sample, by [@compulim](https://github.com/compulim) in PR [#3820](https://github.com/microsoft/BotFramework-WebChat/pull/3820)

## [4.12.1] - 2021-03-16

### Added

-  Resolves [#3777](https://github.com/microsoft/BotFramework-WebChat/issues/3777). Added a new `adaptiveCardsParserMaxVersion` style options for selecting the maximum supported version when parsing an Adaptive Cards, by [@compulim](https://github.com/compulim) in PR [#3778](https://github.com/microsoft/BotFramework-WebChat/pull/3778)

### Fixed

-  Fixes [#3773](https://github.com/microsoft/BotFramework-WebChat/issues/3773). Remove `replyToId` when using Direct Line Speech adapter, by [@compulim](https://github.com/compulim) in PR [#3776](https://github.com/microsoft/BotFramework-WebChat/pull/3776)

### Samples

-  Fixes [#3632](https://github.com/microsoft/BotFramework-WebChat/issues/3632). Update reaction button sample : Add replyToId to the postActivity object, by [@amal-khalaf](https://github.com/amal-khalaf) in PR [#3769](https://github.com/microsoft/BotFramework-WebChat/pull/3769)
-  Fixes [#2343](https://github.com/microsoft/BotFramework-WebChat/issues/2343). Add sample for Direct Line tokens, by [@navzam](https://github.com/navzam), in PR [#3779](https://github.com/microsoft/BotFramework-WebChat/pull/3779)

## [4.12.0] - 2021-03-01

### Added

-  Resolves [#2745](https://github.com/microsoft/BotFramework-WebChat/issues/2745). Added new `flow` layout to suggested actions, by [@compulim](https://github.com/compulim) in PR [#3641](https://github.com/microsoft/BotFramework-WebChat/pull/3641) and PR [#3748](https://github.com/microsoft/BotFramework-WebChat/pull/3748)
-  Added new style options to customize auto-scroll, by [@compulim](https://github.com/compulim) in PR [#3653](https://github.com/microsoft/BotFramework-WebChat/pull/3653)
   -  Set `autoScrollSnapOnActivity` to `true` to pause auto-scroll after more than one activity is shown, or a number to pause after X number of activities
   -  Set `autoScrollSnapOnPage` to `true` to pause auto-scroll when a page is filled, or a number between `0` and `1` to pause after % of page is filled
   -  Set `autoScrollSnapOnActivityOffset` and `autoScrollSnapOnPageOffset` to a number (in pixels) to overscroll/underscroll after the pause
-  Supports multiple transcripts in a single composition, by [@compulim](https://github.com/compulim) in PR [#3653](https://github.com/microsoft/BotFramework-WebChat/pull/3653)
-  Resolves [#3368](https://github.com/microsoft/BotFramework-WebChat/issues/3368). Added new `sendBoxButtonAlignment` for button alignment in multi-line text mode, by [@compulim](https://github.com/compulim) in PR [#3668](https://github.com/microsoft/BotFramework-WebChat/pull/3668)
-  Resolves [#3666](https://github.com/microsoft/BotFramework-WebChat/issues/3666). Added support of sovereign clouds when using Direct Line Speech, by [@compulim](https://github.com/compulim) in PR [#3694](https://github.com/microsoft/BotFramework-WebChat/pull/3694)
   -  Please refer to [`DIRECT_LINE_SPEECH.md`](https://github.com/microsoft/BotFramework-WebChat/blob/main/docs/DIRECT_LINE_SPEECH.md#directlinespeechcredentials) for instructions
-  Resolves [#2996](https://github.com/microsoft/BotFramework-WebChat/issues/2996). Added transcript navigation by keyboard navigation keys, by [@compulim](https://github.com/compulim) in PR [#3703](https://github.com/microsoft/BotFramework-WebChat/pull/3703)
-  Resolves [#3703](https://github.com/microsoft/BotFramework-WebChat/issues/3703). Fixed `enterKeyHint` props warning, by [@compulim](https://github.com/compulim) in PR [#3703](https://github.com/microsoft/BotFramework-WebChat/pull/3703)
-  Resolves [#3544](https://github.com/microsoft/BotFramework-WebChat/issues/3544). Send user ID from props to chat adapter, by [@timenick](https://github.com/timenick) in PR [#3544)(https://github.com/microsoft/BotFramework-WebChat/issues/3544).
-  Resolves [#3562](https://github.com/microsoft/BotFramework-WebChat/issues/3562). Add button word wrap to suggested actions stacked layout, by [@corinagum](https://github.com/corinagum), in PR [#3728](https://github.com/microsoft/BotFramework-WebChat/pull/3728) and [#3745](https://github.com/microsoft/BotFramework-WebChat/pull/3745)
-  Resolves [#3658](https://github.com/microsoft/BotFramework-WebChat/issues/3658). Added new `containerRole` to default style options, by [@nfreear](https://github.com/nfreear) in PR [#3669](https://github.com/microsoft/BotFramework-WebChat/pull/3669)
-  Resolves [#3754](https://github.com/microsoft/BotFramework-WebChat/issues/3754). Added new `useObserveTranscriptFocus` hook, by [@compulim](https://github.com/compulim) in PR [#3755](https://github.com/microsoft/BotFramework-WebChat/pull/3755)
-  Translation for Yue, by [@compulim](https://github.com/compulim) in PR [#3749](https://github.com/microsoft/BotFramework-WebChat/pulls/3749)

### Fixed

-  Fixes [#3278](https://github.com/microsoft/BotFramework-WebChat/issues/3278). Update `HOOKS.md` verbiage, by [@corinagum](https://github.com/corinagum) in PR [#3564](https://github.com/microsoft/BotFramework-WebChat/pull/3564)
-  Fixes [#3534](https://github.com/microsoft/BotFramework-WebChat/issues/3534). Remove 2020 deprecations, by [@corinagum](https://github.com/corinagum) in PR [#3564](https://github.com/microsoft/BotFramework-WebChat/pull/3564) and [#3728](https://github.com/microsoft/BotFramework-WebChat/pull/3728)
-  Fixes [#3561](https://github.com/microsoft/BotFramework-WebChat/issues/3561). Remove MyGet mentions from samples, by [@corinagum](https://github.com/corinagum) in PR [#3564](https://github.com/microsoft/BotFramework-WebChat/pull/3564)
-  Fixes [#3537](https://github.com/microsoft/BotFramework-WebChat/issues/3537). Fix some carousels improperly using aria-roledescription, by [@corinagum](https://github.com/corinagum) in PR [#3599](https://github.com/microsoft/BotFramework-WebChat/pull/3599)
-  Fixes [#3483](https://github.com/microsoft/BotFramework-WebChat/issues/3483). IE11 anchors fixed to open securely without 'noreferrer' or 'noopener', by [@corinagum](https://github.com/corinagum) in PR [#3607](https://github.com/microsoft/BotFramework-WebChat/pull/3607)
-  Fixes [#3565](https://github.com/microsoft/BotFramework-WebChat/issues/3565). Allow strikethrough `<s>` on sanitize markdown, by [@corinagum](https://github.com/corinagum) in PR [#3646](https://github.com/microsoft/BotFramework-WebChat/pull/3646)
-  Fixes [#3672](https://github.com/microsoft/BotFramework-WebChat/issues/3672). Center the icon of send box buttons vertically and horizontally, by [@compulim](https://github.com/compulim) in PR [#3673](https://github.com/microsoft/BotFramework-WebChat/pull/3673)
-  Fixes [#3683](https://github.com/microsoft/BotFramework-WebChat/issues/3683). Activities should be acknowledged when user scrolls to bottom, by [@compulim](https://github.com/compulim) in PR [#3684](https://github.com/microsoft/BotFramework-WebChat/pull/3684)
-  Fixes [#3431](https://github.com/microsoft/BotFramework-WebChat/issues/3431). Race condition between the first bot activity and first user activity should not cause the first bot activity to be delayed, by [@compulim](https://github.com/compulim) in PR [#3705](https://github.com/microsoft/BotFramework-WebChat/pull/3705)
-  Fixes [#3676](https://github.com/microsoft/BotFramework-WebChat/issues/3676). Activities without text should not generate bogus `aria-labelledby`, by [@compulim](https://github.com/compulim) in PR [#3697](https://github.com/microsoft/BotFramework-WebChat/pull/3697)
-  Fixes [#3625](https://github.com/microsoft/BotFramework-WebChat/issues/3625). Update 'no screen reader for custom activity middleware' warning and add screen reader renderer documentation to `ACCESSIBILITY.md`, by [@corinagum](https://github.com/corinagum) in PR [#3689](https://github.com/microsoft/BotFramework-WebChat/pull/3689)
-  Fixes [#3453](https://github.com/microsoft/BotFramework-WebChat/issues/3453). Fixes plain text file attachments to show download link when uploaded, by [@corinagum](https://github.com/corinagum) in PR [#3711](https://github.com/microsoft/BotFramework-WebChat/pull/3711)
-  Fixes [#3612](https://github.com/microsoft/BotFramework-WebChat/issues/3612). Carousel flippers in suggested actions are given extra padding, by [@compulim](https://github.com/compulim) and [@Quirinevwm](https://github.com/Quirinevwm) in PR [#3704](https://github.com/microsoft/BotFramework-WebChat/pull/3704)
-  Fixes [#3411](https://github.com/microsoft/BotFramework-WebChat/issues/3411). With Direct Line Speech, clicking on microphone button during speech recognition should no longer stop working, by [@compulim](https://github.com/compulim) in PR [#3694](https://github.com/microsoft/BotFramework-WebChat/pull/3694)
   -  Although it no locker lock up microphone, clicking on the microphone button has no effect because Direct Line Speech does not support aborting speech recognition
-  Fixes [#3421](https://github.com/microsoft/BotFramework-WebChat/issues/3421). With Direct Line Speech, after not able to recognize any speech, it should no longer stop working, by [@compulim](https://github.com/compulim) in PR [#3694](https://github.com/microsoft/BotFramework-WebChat/pull/3694)
-  Fixes [#3616](https://github.com/microsoft/BotFramework-WebChat/issues/3616). [Accessibility documentation] Update activity timestamp grouping to match visual UI, by [@amal-khalaf](https://github.com/amal-khalaf) in PR [#3708](https://github.com/microsoft/BotFramework-WebChat/pull/3708)
-  Fixes [#3718](https://github.com/microsoft/BotFramework-WebChat/issues/3718). Fixed `webpack.config.js` to use default settings of `['browser', 'module', 'main']` and resolved issues with `uuid` package in IE11, by [@compulim](https://github.com/compulim) in PR [#3726](https://github.com/microsoft/BotFramework-WebChat/pull/3726)
-  Fixes [#3622](https://github.com/microsoft/BotFramework-WebChat/issues/3622). Apply pushed button style options and `aria-pressed` on Adaptive Cards selected buttons, by [@amal-khalaf](https://github.com/amal-khalaf) in PR [#3710](https://github.com/microsoft/BotFramework-WebChat/pull/3710)
-  Fixes [#3618](https://github.com/microsoft/BotFramework-WebChat/issues/3618). Fix Adaptive Cards anchors being disabled when Adaptive Cards is obsolete, by [@corinagum](https://github.com/corinagum) in PR [#3687](https://github.com/microsoft/BotFramework-WebChat/pull/3687)
-  Fixes [#3747](https://github.com/microsoft/BotFramework-WebChat/issues/3747). `aria-pressed` and `aria-role` is not properly set on Adaptive Cards submit buttons, by [@amal-khalaf](https://github.com/amal-khalaf) in PR [#3744](https://github.com/microsoft/BotFramework-WebChat/pull/3744)
-  Fixes [#3750](https://github.com/microsoft/BotFramework-WebChat/issues/3750). Debump Node.js engines requirements for some packages to `12.0.0`, by [@compulim](https://github.com/compulim) in PR [#3753](https://github.com/microsoft/BotFramework-WebChat/pull/3753)
-  Fixes [#3760](https://github.com/microsoft/BotFramework-WebChat/issues/3760). Use `<ErrorBoundary>` to wrap around attachment renderer, by [@compulim](https://github.com/compulim) in PR [#3761](https://github.com/microsoft/BotFramework-WebChat/pull/3761)
-  Fixes [#3764](https://github.com/microsoft/BotFramework-WebChat/issues/3764). Added `role="group"` to the focusable transcript to enable `aria-activedescendant`, by [@compulim](https://github.com/compulim) in PR [#3765](https://github.com/microsoft/BotFramework-WebChat/issues/3765)

### Changed

-  Bumped all dependencies to the latest versions, by [@compulim](https://github.com/compulim) in PR [#3594](https://github.com/microsoft/BotFramework-WebChat/pull/3594), PR [#3694](https://github.com/microsoft/BotFramework-WebChat/pull/3694), and PR [#3544](https://github.com/microsoft/BotFramework-WebChat/pull/3544)
   -  Development dependencies
      -  [`@babel/cli@7.12.1`](https://npmjs.com/package/@babel/cli)
      -  [`@babel/core@7.12.3`](https://npmjs.com/package/@babel/core)
      -  [`@babel/plugin-proposal-class-properties@7.12.1`](https://npmjs.com/package/@babel/plugin-proposal-class-properties)
      -  [`@babel/plugin-proposal-object-rest-spread@7.12.1`](https://npmjs.com/package/@babel/plugin-proposal-object-rest-spread)
      -  [`@babel/plugin-transform-runtime@7.12.1`](https://npmjs.com/package/@babel/plugin-transform-runtime)
      -  [`@babel/preset-env@7.12.1`](https://npmjs.com/package/@babel/preset-env)
      -  [`@babel/preset-react@7.12.5`](https://npmjs.com/package/@babel/preset-react)
      -  [`@babel/preset-typescript@7.12.1`](https://npmjs.com/package/@babel/preset-typescript)
      -  [`@babel/runtime@7.12.5`](https://npmjs.com/package/@babel/runtime)
      -  [`@types/node@14.14.6`](https://npmjs.com/package/@types/node)
      -  [`@types/react@16.9.55`](https://npmjs.com/package/@types/react)
      -  [`@typescript-eslint/eslint-plugin@4.6.1`](https://npmjs.com/package/@typescript-eslint/eslint-plugin)
      -  [`@typescript-eslint/parser@4.6.1`](https://npmjs.com/package/@typescript-eslint/parser)
      -  [`babel-jest@26.6.3`](https://npmjs.com/package/babel-jest)
      -  [`eslint-plugin-prettier@3.1.4`](https://npmjs.com/package/eslint-plugin-prettier)
      -  [`eslint-plugin-react-hooks@4.2.0`](https://npmjs.com/package/eslint-plugin-react-hooks)
      -  [`eslint-plugin-react@7.21.5`](https://npmjs.com/package/eslint-plugin-react)
      -  [`eslint@7.12.1`](https://npmjs.com/package/eslint)
      -  [`husky@4.3.0`](https://npmjs.com/package/husky)
      -  [`jest-image-snapshot@4.2.0`](https://npmjs.com/package/jest-image-snapshot)
      -  [`jest-junit@12.0.0`](https://npmjs.com/package/jest-junit)
      -  [`jest-trx-results-processor@2.2.0`](https://npmjs.com/package/jest-trx-results-processor)
      -  [`jest@26.6.3`](https://npmjs.com/package/jest)
      -  [`lint-staged@10.5.1`](https://npmjs.com/package/lint-staged)
      -  [`lolex@6.0.0`](https://npmjs.com/package/lolex)
      -  [`node-dev@6.2.0`](https://npmjs.com/package/node-dev)
      -  [`node-fetch@2.6.1`](https://npmjs.com/package/node-fetch)
      -  [`prettier@2.1.2`](https://npmjs.com/package/prettier)
      -  [`source-map-loader@1.1.2`](https://npmjs.com/package/source-map-loader)
      -  [`terser-webpack-plugin@4.2.3`](https://npmjs.com/package/terser-webpack-plugin)
      -  [`typescript@4.0.5`](https://npmjs.com/package/typescript)
      -  [`webpack-cli@4.2.0`](https://npmjs.com/package/webpack-cli)
      -  [`webpack-stats-plugin@1.0.2`](https://npmjs.com/package/webpack-stats-plugin)
      -  [`webpack@4.44.2`](https://npmjs.com/package/webpack)
   -  Production dependencies
      -  [`@babel/runtime@7.12.5`](https://npmjs.com/package/@babel/runtime)
      -  [`botframework-directlinejs@0.14.1`](https://npmjs.com/package/botframework-directlinejs)
      -  [`globalize@1.6.0`](https://npmjs.com/package/globalize)
      -  [`markdown-it@12.0.2`](https://npmjs.com/package/markdown-it)
      -  [`microsoft-cognitiveservices-speech-sdk@1.15.1`](https://npmjs.com/package/microsoft-cognitiveservices-speech-sdk)
      -  [`react-redux@7.2.2`](https://npmjs.com/package/react-redux)
      -  [`redux@4.0.5`](https://npmjs.com/package/redux)
      -  [`sanitize-html@2.1.2`](https://npmjs.com/package/sanitize-html)
      -  [`web-speech-cognitive-services@7.1.0`](https://npmjs.com/package/web-speech-cognitive-services)
      -  [`whatwg-fetch@3.4.1`](https://npmjs.com/package/whatwg-fetch)
-  Resolves [#3392](https://github.com/microsoft/BotFramework-WebChat/issues/3392) Bumped Adaptive Cards to 2.5.0, by [@corinagum](https://github.com/corinagum) in PR [#3630](https://github.com/microsoft/BotFramework-WebChat/pull/3630)

### Samples

-  Fixes [#3473](https://github.com/microsoft/BotFramework-WebChat/issues/3473). Fix samples using activityMiddleware (from 4.10.0 breaking changes), by [@corinagum](https://github.com/corinagum) in PR [#3601](https://github.com/microsoft/BotFramework-WebChat/pull/3601)
-  Fixes [#3582](https://github.com/microsoft/BotFramework-WebChat/issues/3582). Fix Disable Adaptive Cards sample, by [@corinagum](https://github.com/corinagum) in PR [#3687](https://github.com/microsoft/BotFramework-WebChat/pull/3687)
-  Fixes [#3434](https://github.com/microsoft/BotFramework-WebChat/issues/3434). Dispatched event, postBack, or messageBack + activityMiddleware causes fatal error, by [@amal-khalaf](https://github.com/amal-khalaf) in PR [#3671](https://github.com/microsoft/BotFramework-WebChat/pull/3671)
-  Fixes [#3215](https://github.com/microsoft/BotFramework-WebChat/issues/3215). Fix SSO samples `window.opener.postMessage`, by [@corinagum](https://github.com/corinagum) in PR [#3696](https://github.com/microsoft/BotFramework-WebChat/pull/3696)

## [4.11.0] - 2020-11-04

### Added

-  Resolves [#3281](https://github.com/microsoft/BotFramework-WebChat/issues/3281). Added documentation on speech permissions for Cordova apps on Android, by [@corinagum](https://github.com/corinagum), in PR [#3508](https://github.com/microsoft/BotFramework-WebChat/pull/3508)
-  Resolves [#3316](https://github.com/microsoft/BotFramework-WebChat/issues/3316). Refactored platform-neutral APIs into the new `api` package, to be reused on React Native component, in PR [#3543](https://github.com/microsoft/BotFramework-WebChat/pull/3543) by [@compulim](https://github.com/compulim)
   -  The new layering is `core` -> `api` -> `component` (HTML-only) -> `bundle`
   -  Includes composition mode, platform-neutral React hooks, and localization resources
   -  Most hooks are available in the new `api` package. Some hooks are only available on the existing `component` package, due to their platform dependency or coupling with visual components. For example, Web Worker, 2D canvas, `useMicrophoneButton*` are not available on the `api` package
   -  Most implementations of middleware are only available in `component` package due to their coupling with visual components or platform features. Some implementations, (e.g. card action middleware and activity grouping middleware) are available on `api` package. For example:
      -  Carousel layout and stacked layout is only available on `component` package due to their coupling with their respective visual components
      -  For card action middleware, `imBack`, `messageBack` and `postBack` actions are available on `api` package, but `call`, `openUrl` and other platform-dependent actions are only available on `component` package
   -  `activityMiddleware`, `attachmentMiddleware`, etc, now support arrays for multiple middleware
-  Resolves [#3535](https://github.com/microsoft/BotFramework-WebChat/issues/3535). Add Technical Support Guide for guidance on troubleshooting information and navigating the Web Chat repository, by [@corinagum](https://github.com/corinagum), in PR [#3645](https://github.com/microsoft/BotFramework-WebChat/pull/3645)

### Fixed

-  Fixes [#3489](https://github.com/microsoft/BotFramework-WebChat/issues/3489). [Accessibility]: Fix AT saying 'Bot undefined said', by [@corinagum](https://github.com/corinagum) in PR [#3524](https://github.com/microsoft/BotFramework-WebChat/pull/3524)
-  Fixes [#3547](https://github.com/microsoft/BotFramework-WebChat/issues/3547). [Accessibility]: Add attachment middleware for screen reader, by [@compulim](https://github.com/compulim) in PR [#3548](https://github.com/microsoft/BotFramework-WebChat/pull/3548)
-  Fixes [#3371](https://github.com/microsoft/BotFramework-WebChat/issues/3371). [Accessibility]: Add alt property for image in HeroCards, by [@corinagum](https://github.com/corinagum) in PR [#3541](https://github.com/microsoft/BotFramework-WebChat/pull/3541)
-  Fixes [#3310](https://github.com/microsoft/BotFramework-WebChat/issues/3310). Add quantity, tap and text field to ReceiptCards, by [@corinagum](https://github.com/corinagum) in PR [#3541](https://github.com/microsoft/BotFramework-WebChat/pull/3541)
-  Fixes [#3514](https://github.com/microsoft/BotFramework-WebChat/issues/3514). Fix PoliCheck language errors, by [@corinagum](https://github.com/corinagum) in PR [#3545](https://github.com/microsoft/BotFramework-WebChat/pull/3545)
-  Fixes [#3537](https://github.com/microsoft/BotFramework-WebChat/issues/3537). [Accessibility]: Ensure `aria-roledescription` is only used on elements with implicit/explicit role based off of [WAI ARIA role attributes](https://www.w3.org/WAI/PF/aria/roles), by [@corinagum](https://github.com/corinagum) in PR [#3551](https://github.com/microsoft/BotFramework-WebChat/pull/3551), [#3583](https://github.com/microsoft/BotFramework-WebChat/pull/3583), and [#3587](https://github.com/microsoft/BotFramework-WebChat/pull/3587)
-  Fixes [#3431](https://github.com/microsoft/BotFramework-WebChat/issues/3431). Activities should not be delayed due to missing activity of type "typing", by [@compulim](https://github.com/compulim) in PR [#3554](https://github.com/microsoft/BotFramework-WebChat/pull/3554)
-  Fixes [#3574](https://github.com/microsoft/BotFramework-WebChat/issues/3574). Creates workaround for Cognitive Services Speech SDK 1.13.1 regarding removed support of macOS/iOS, by [@compulim](https://github.com/compulim) in PR [#3576](https://github.com/microsoft/BotFramework-WebChat/pull/3576)
-  Fixes [#3570](https://github.com/microsoft/BotFramework-WebChat/issues/3570). Adaptive Card `speak` property should be narrated by screen reader, by [@compulim](https://github.com/compulim) in PR [#3573](https://github.com/microsoft/BotFramework-WebChat/pull/3573) and PR [#3584](https://github.com/microsoft/BotFramework-WebChat/pull/3584)
-  Fixes [#3571](https://github.com/microsoft/BotFramework-WebChat/issues/3571). Error box should be hidden for Adaptive Card renderer when running in production mode, by [@compulim](https://github.com/compulim) in PR [#3573](https://github.com/microsoft/BotFramework-WebChat/pull/3573)

### Changed

-  Bumped development dependency [`node-fetch@2.6.1`](https://npmjs.com/package/node-fetch) in PR [#3467](https://github.com/microsoft/BotFramework-WebChat/pull/3467) by [@dependabot](https://github.com/dependabot)
-  Bumped Cognitive Services Speech SDK to 1.13.1, by [@compulim](https://github.com/compulim) in PR [#3432](https://github.com/microsoft/BotFramework-WebChat/pull/3432)
   -  [`microsoft-cognitiveservices-speech-sdk@1.13.1`](https://npmjs.com/package/microsoft-cognitiveservices-speech-sdk)

### Samples

-  Fixes [#3526](https://github.com/microsoft/BotFramework-WebChat/issues/3526). Add info on composition mode in sample 06.d, by [@corinagum](https://github.com/corinagum) in PR [#3541](https://github.com/microsoft/BotFramework-WebChat/pull/3541)

## [4.10.1] - 2020-09-09

### Breaking changes

-  To support Content Security Policy, [`glamor`](https://npmjs.com/package/glamor) is being replaced by [`create-emotion`](https://npmjs.com/package/create-emotion). The CSS hash and rule name is being prefixed with `webchat--css` with a random value.

### Fixed

-  Fixes [#3431](https://github.com/microsoft/BotFramework-WebChat/issues/3431). Removed delay of first activity with `replyToId` pointing to a missing activity, by [@compulim](https://github.com/compulim) in PR [#3450](https://github.com/microsoft/BotFramework-WebChat/pull/3450)
-  Fixes [#3439](https://github.com/microsoft/BotFramework-WebChat/issues/3439). Use consistent return type in default CardActionContext.getSignInUrl(), by [@stevengum](https://github.com/stevengum) in PR [#3459](https://github.com/microsoft/BotFramework-WebChat/pull/3459)
-  Fixes [#3444](https://github.com/microsoft/BotFramework-WebChat/issues/3444). Make suggested actions container height styleOption flexible, by [@corinagum](https://github.com/corinagum) in PR [#3456](https://github.com/microsoft/BotFramework-WebChat/pull/3456)

### Changed

-  Bumped [`botframework-directlinejs@0.13.1`](https://npmjs.com/package/botframework-directlinejs), by [@compulim](https://github.com/compulim) in PR [#3461](https://github.com/microsoft/BotFramework-WebChat/pull/3461)
-  Support Content Security Policy, in PR [#3443](https://github.com/microsoft/BotFramework-WebChat/pull/3443) by [@compulim](https://github.com/compulim)
   -  Moved from [`glamor@2.20.40`](https://npmjs.com/package/glamor) to [`create-emotion@10.0.27`](https://npmjs.com/package/create-emotion)
   -  Inlined assets are now using `blob:` scheme, instead of `data:` scheme
   -  Detect Web Worker support by loading a dummy Web Worker, instead of checking `window.MessagePort` and `window.Worker`
   -  Data URI used in image of attachments will be converted to URL with scheme of `blob:`
   -  Bumped dependencies
      -  [`react-film@3.0.0`](https://npmjs.com/package/react-film)
      -  [`react-scroll-to-bottom@4.0.0`](https://npmjs.com/package/react-scroll-to-bottom)
-  Bumped all dependencies to the latest versions, by [@corinagum](https://github.com/corinagum) in PR [#3380](https://github.com/microsoft/BotFramework-WebChat/pull/3380), [#3442](https://github.com/microsoft/BotFramework-WebChat/pull/3442)
   -  Development dependencies
      -  Root package
         -  [`@babel/plugin-proposal-class-properties@7.10.4`](https://npmjs.com/package/@babel/plugin-proposal-class-properties)
         -  [`@babel/plugin-proposal-object-rest-spread@7.11.0`](https://npmjs.com/package/@babel/plugin-proposal-object-rest-spread)
         -  [`@babel/plugin-transform-runtime@7.11.0`](https://npmjs.com/package/@babel/plugin-transform-runtime)
         -  [`@babel/preset-env@7.11.0`](https://npmjs.com/package/@babel/preset-env)
         -  [`@babel/preset-react@7.10.4`](https://npmjs.com/package/@babel/preset-react)
         -  [`@babel/preset-typescript@7.10.4`](https://npmjs.com/package/@babel/preset-typescript)
         -  [`@babel/runtime@7.11.2`](https://npmjs.com/package/@babel/runtime)
         -  [`babel-jest@26.4.0`](https://npmjs.com/package/babel-jest)
         -  [`concurrently@5.3.0`](https://npmjs.com/package/concurrently)
         -  [`core-js@3.6.5`](https://npmjs.com/package/core-js)
         -  [`global-agent@2.1.12`](https://npmjs.com/package/global-agent)
         -  [`husky@4.2.5`](https://npmjs.com/package/husky)
         -  [`jest@26.2.2`](https://npmjs.com/package/jest)
         -  [`jest-image-snapshot@4.1.0`](https://npmjs.com/package/jest-image-snapshot)
         -  [`jest-junit@11.1.0`](https://npmjs.com/package/jest-junit)
         -  [`jest-trx-results-processor@2.0.3`](https://npmjs.com/package/jest-trx-results-processor)
         -  [`lerna@3.22.1`](https://npmjs.com/package/lerna)
         -  [`lint-staged@10.2.13`](https://npmjs.com/package/lint-staged)
         -  [`prettier@2.0.5`](https://npmjs.com/package/prettier)
         -  [`serve@11.3.2`](https://npmjs.com/package/serve)
         -  [`serve-handler@6.1.3`](https://npmjs.com/package/serve-handler)
         -  Removed unused package [`@azure/storage-blob@12.1.0`](https://npmjs.com/package/@azure/storage-blob)
      -  Other packages
         -  [`@babel/cli@7.10.5`](https://npmjs.com/package/@babel/cli)
         -  [`@babel/core@7.11.0`](https://npmjs.com/package/@babel/core)
         -  [`@babel/plugin-proposal-class-properties@7.10.4`](https://npmjs.com/package/@babel/plugin-proposal-class-properties)
         -  [`@babel/plugin-proposal-object-rest-spread@7.11.0`](https://npmjs.com/package/@babel/plugin-proposal-object-rest-spread)
         -  [`@babel/plugin-transform-runtime@7.11.0`](https://npmjs.com/package/@babel/plugin-transform-runtime)
         -  [`@babel/preset-env@7.11.0`](https://npmjs.com/package/@babel/preset-env)
         -  [`@babel/preset-react@7.10.4`](https://npmjs.com/package/@babel/preset-react)
         -  [`@babel/preset-typescript@7.10.4`](https://npmjs.com/package/@babel/preset-typescript)
         -  [`@types/node@14.6.0`](https://npmjs.com/package/@types/node)
         -  [`@types/react@16.9.47`](https://npmjs.com/package/@types/react)
         -  [`@typescript-eslint/eslint-plugin@3.10.1`](https://npmjs.com/package/@typescript-eslint/eslint-plugin)
         -  [`@typescript-eslint/parser@3.10.1`](https://npmjs.com/package/@typescript-eslint/parser)
         -  [`babel-jest@26.2.2`](https://npmjs.com/package/babel-jest)
         -  [`concurrently@5.3.0`](https://npmjs.com/package/concurrently)
         -  [`copy-webpack-plugin@6.0.3`](https://npmjs.com/package/copy-webpack-plugin)
         -  [`core-js@3.6.5`](https://npmjs.com/package/core-js)
         -  [`cross-env@7.0.2`](https://npmjs.com/package/cross-env)
         -  [`css-loader@4.2.0`](https://npmjs.com/package/css-loader)
         -  [`eslint-plugin-prettier@3.1.4`](https://npmjs.com/package/eslint-plugin-prettier)
         -  [`eslint-plugin-react-hooks@4.1.0`](https://npmjs.com/package/eslint-plugin-react-hooks)
         -  [`eslint-plugin-react@7.20.6`](https://npmjs.com/package/eslint-plugin-react)
         -  [`eslint@7.7.0`](https://npmjs.com/package/eslint)
         -  [`global-agent@2.1.12`](https://npmjs.com/package/global-agent)
         -  [`globalize-compiler@1.1.1`](https://npmjs.com/package/globalize-compiler)
         -  [`html-webpack-plugin@4.3.0`](https://npmjs.com/package/html-webpack-plugin)
         -  [`http-proxy-middleware@1.0.5`](https://npmjs.com/package/http-proxy-middleware)
         -  [`jest@26.2.2`](https://npmjs.com/package/jest)
         -  [`node-dev@5.2.0`](https://npmjs.com/package/node-dev)
         -  [`prettier@2.1.1`](https://npmjs.com/package/prettier)
         -  [`pug@3.0.0`](https://npmjs.com/package/pug)
         -  [`serve@11.3.2`](https://npmjs.com/package/serve)
         -  [`simple-update-in@2.2.0`](https://npmjs.com/package/simple-update-in)
         -  [`source-map-loader@1.0.2`](https://npmjs.com/package/source-map-loader)
         -  [`terser-webpack-plugin@4.1.0`](https://npmjs.com/package/terser-webpack-plugin)
         -  [`typescript@4.0.2`](https://npmjs.com/package/typescript)
         -  [`webpack-cli@3.3.12`](https://npmjs.com/package/webpack-cli)
         -  [`webpack-stats-plugin@0.3.2`](https://npmjs.com/package/webpack-stats-plugin)
         -  [`webpack@4.44.1`](https://npmjs.com/package/webpack)
   -  Production dependencies
      -  [`@babel/plugin-proposal-async-generator-functions@7.10.5`](https://npmjs.com/package/@babel/plugin-proposal-async-generator-functions)
      -  [`@babel/runtime@7.11.2`](https://npmjs.com/package/@babel/runtime)
      -  [`@babel/standalone@7.11.0`](https://npmjs.com/package/@babel/standalone)
      -  [`abort-controller-es5@1.2.0`](https://npmjs.com/package/abort-controller-es5)
      -  [`botframework-directlinejs@0.13.0`](https://npmjs.com/package/botframework-directlinejs)
      -  [`core-js@3.6.5`](https://npmjs.com/package/core-js)
      -  [`event-iterator@2.0.0`](https://npmjs.com/package/event-iterator)
      -  [`event-target-shim-es5@1.2.0`](https://npmjs.com/package/event-target-shim-es5)
      -  [`expect@25.5.0`](https://npmjs.com/package/expect)
      -  [`globalize@1.5.0`](https://npmjs.com/package/globalize)
      -  [`markdown-it-attrs-es5@1.2.0`](https://npmjs.com/package/markdown-it-attrs-es5)
      -  [`markdown-it-attrs@3.0.3`](https://npmjs.com/package/markdown-it-attrs)
      -  [`markdown-it@11.0.0`](https://npmjs.com/package/markdown-it)
      -  [`math-random@2.0.1`](https://npmjs.com/package/math-random)
      -  [`memoize-one@5.1.1`](https://npmjs.com/package/memoize-one)
      -  [`mime@2.4.6`](https://npmjs.com/package/mime)
      -  [`on-error-resume-next@1.1.0`](https://npmjs.com/package/on-error-resume-next)
      -  [`p-defer@3.0.0`](https://npmjs.com/package/p-defer)
      -  [`p-defer-es5@1.2.1`](https://npmjs.com/package/p-defer-es5)
      -  [`react-say@2.0.2-master.ee7cd76`](https://npmjs.com/package/react-say)
      -  [`react-scroll-to-bottom@3.0.1-master.9e2b9d8`](https://npmjs.com/package/react-scroll-to-bottom)
      -  [`sanitize-html@1.27.4`](https://npmjs.com/package/sanitize-html)
      -  [`simple-update-in@2.2.0`](https://npmjs.com/package/simple-update-in)
      -  [`url-search-params-polyfill@8.1.0`](https://npmjs.com/package/url-search-params-polyfill)
      -  [`web-speech-cognitive-services@7.0.2-master.6004e4b`](https://npmjs.com/package/web-speech-cognitive-services)
      -  [`whatwg-fetch@3.4.0`](https://npmjs.com/package/whatwg-fetch)

### Samples

-  Added Content Security Policy sample, by [@compulim](https://github.com/compulim), in PR [#3443](https://github.com/microsoft/BotFramework-WebChat/pull/3443)
-  Update `create-react-app`-based samples to resolve `p-defer` as peer dependency, by [@compulim](https://github.com/compulim), in PR [#3457](https://github.com/microsoft/BotFramework-WebChat/pull/3457)
-  Bump [`encoding@0.1.13`](https://npmjs.com/package/encoding) in [`06.recomposing-ui/c.smart-display`](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/06.recomposing-ui/c.smart-display), by [@compulim](https://github.com/compulim), in PR [#3458](https://github.com/microsoft/BotFramework-WebChat/pull/3458)

## [4.10.0] - 2020-08-18

### Breaking changes

-  Due to the complexity, we are no longer exposing `<CarouselLayout>` and `<StackedLayout>`. Please use `<BasicTranscript>` to render the transcript instead.
-  With the new activity grouping feature:
   -  Customized avatar cannot be wider than `styleOptions.avatarSize`. If you want to show a wider avatar, please increase `styleOptions.avatarSize`.
   -  If customized avatar is rendering `false`, bubble will still be padded to leave a gutter for the empty customized avatar. To hide gutter, please set `styleOptions.botAvatarInitials` and `styleOptions.userAvatarInitials` to falsy.
-  Default bubble nub offset is set to `0`, previously `"bottom"` (or `-0`)
   -  Previously, we put the bubble nub at the bottom while keeping the avatar on top. This is not consistent in the new layout.
-  By default, we will group avatar per status group.
   -  If you want to switch back to previous behaviors, please set `styleOptions.showAvatarInGroup` to `true`.
-  Default `botAvatarInitials` and `userAvatarInitials` is changed to `undefined`, from `""` (empty string)
   -  When the initials is `undefined`, no gutter space will be reserved for the avatar.
   -  When the initials is `""` (empty string), gutter space will be reserved, but not avatar will be shown.
-  [`useRenderActivity`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/HOOKS.md#userenderactivity) hook is being deprecated, in favor of the new [`useCreateActivityRenderer`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/HOOKS.md#usecreateactivityrenderer) hook.
-  [`useRenderActivityStatus`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/HOOKS.md#userenderactivitystatus) hook is being deprecated, in favor of the new [`useCreateActivityStatusRenderer`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/HOOKS.md#usecreateactivitystatusrenderer) hook.
-  [`useRenderAvatar`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/HOOKS.md#userenderavatar) hook is being deprecated, in favor of the new [`useCreateAvatarRenderer`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/HOOKS.md#usecreateavatarrenderer) hook.

#### Change in general middleware design

> This change will impact middleware which use downstream result.

Previously, when a middleware is called, they are passed with a single argument.

Starting from 4.10.0, multiple arguments could be passed to the middleware. All middleware should pass all arguments to the downstream middleware. This change enables future extension to the middleware pattern.

For example, a passthrough middleware was:

<!-- prettier-ignore-start -->
```js
() => next => card => next(card)
```
<!-- prettier-ignore-end -->

It should become:

<!-- prettier-ignore-start -->
```js
() => next => (...args) => next(...args)
```
<!-- prettier-ignore-end -->

This also applies to the render function returned by activity middleware. The previous signature was:

<!-- prettier-ignore-start -->
```js
() => next => card => children => next(card)(children)
```
<!-- prettier-ignore-end -->

It should become:

<!-- prettier-ignore-start -->
```js
() => next => (...setupArgs) => (...renderArgs) => next(...setupArgs)(...renderArgs)
```
<!-- prettier-ignore-end -->

> Note: Please read the following section for another change in the activity middleware signature for decorators.

#### Change in activity middleware

> This change will impact activity middleware used for decoration.

Previously, when an activity middleware hid a specific activity from view, it returned a function, `() => false`.

Starting in 4.10.0, if an activity needs to be hidden from the view, the middleware should return `false` instead of `() => false`. This change allows transcript to correctly group activities and ignore activities that are not in view.

To avoid the `TypeError: x is not a function` error, all middleware should be aware that downstream middleware may return `false` instead of a function.

For example, when an event activity is hidden from the view, the terminator middleware will now return `false`. All decoration middleware should check if the downstream result is `false` (or falsy value), and return the value as-is to upstream middleware.

Previously, a simple decorator was:

<!-- prettier-ignore-start -->
```js
() => next => (...setupArgs) => (...renderArgs) => {
  const render = next(...setupArgs);
  const element = render(...renderArgs);

  return element && <div>{element}</div>;
}
```
<!-- prettier-ignore-end -->

It should check the result from downstream middleware. If it is falsy, it should return as-is to the upstream middleware:

<!-- prettier-ignore-start -->
```js
() => next => (...setupArgs) => {
  const render = next(...setupArgs);

  return render && (...renderArgs) => {
    const element = render(...renderArgs);

    return element && <div>{element}</div>;
  };
}
```
<!-- prettier-ignore-end -->

### Changed

-  Bumped all dependencies to the latest versions, by [@compulim](https://github.com/compulim) in PR [#3380](https://github.com/microsoft/BotFramework-WebChat/pull/3380), [#3388](https://github.com/microsoft/BotFramework-WebChat/pull/3388), and [#3418](https://github.com/microsoft/BotFramework-WebChat/pull/3418)
   -  Development dependencies
      -  Root package
         -  [`@babel/plugin-proposal-class-properties@7.10.4`](https://npmjs.com/package/@babel/plugin-proposal-class-properties)
         -  [`@babel/plugin-proposal-object-rest-spread@7.11.0`](https://npmjs.com/package/@babel/plugin-proposal-object-rest-spread)
         -  [`@babel/plugin-transform-runtime@7.11.0`](https://npmjs.com/package/@babel/plugin-transform-runtime)
         -  [`@babel/preset-env@7.11.0`](https://npmjs.com/package/@babel/preset-env)
         -  [`@babel/preset-react@7.10.4`](https://npmjs.com/package/@babel/preset-react)
         -  [`@babel/preset-typescript@7.10.4`](https://npmjs.com/package/@babel/preset-typescript)
         -  [`@babel/runtime@7.11.0`](https://npmjs.com/package/@babel/runtime)
         -  [`babel-jest@26.2.2`](https://npmjs.com/package/babel-jest)
         -  [`concurrently@5.2.0`](https://npmjs.com/package/concurrently)
         -  [`core-js@3.6.5`](https://npmjs.com/package/core-js)
         -  [`global-agent@2.1.12`](https://npmjs.com/package/global-agent)
         -  [`husky@4.2.5`](https://npmjs.com/package/husky)
         -  [`jest@26.2.2`](https://npmjs.com/package/jest)
         -  [`jest-image-snapshot@4.1.0`](https://npmjs.com/package/jest-image-snapshot)
         -  [`jest-junit@11.1.0`](https://npmjs.com/package/jest-junit)
         -  [`jest-trx-results-processor@2.0.3`](https://npmjs.com/package/jest-trx-results-processor)
         -  [`lerna@3.22.1`](https://npmjs.com/package/lerna)
         -  [`lint-staged@10.2.11`](https://npmjs.com/package/lint-staged)
         -  [`prettier@2.0.5`](https://npmjs.com/package/prettier)
         -  [`serve@11.3.2`](https://npmjs.com/package/serve)
         -  [`serve-handler@6.1.3`](https://npmjs.com/package/serve-handler)
         -  Removed unused package [`@azure/storage-blob@12.1.0`](https://npmjs.com/package/@azure/storage-blob)
      -  Other packages
         -  [`@babel/cli@7.10.5`](https://npmjs.com/package/@babel/cli)
         -  [`@babel/core@7.11.0`](https://npmjs.com/package/@babel/core)
         -  [`@babel/plugin-proposal-class-properties@7.10.4`](https://npmjs.com/package/@babel/plugin-proposal-class-properties)
         -  [`@babel/plugin-proposal-object-rest-spread@7.11.0`](https://npmjs.com/package/@babel/plugin-proposal-object-rest-spread)
         -  [`@babel/plugin-transform-runtime@7.11.0`](https://npmjs.com/package/@babel/plugin-transform-runtime)
         -  [`@babel/preset-env@7.11.0`](https://npmjs.com/package/@babel/preset-env)
         -  [`@babel/preset-react@7.10.4`](https://npmjs.com/package/@babel/preset-react)
         -  [`@babel/preset-typescript@7.10.4`](https://npmjs.com/package/@babel/preset-typescript)
         -  [`@types/node@14.0.27`](https://npmjs.com/package/@types/node)
         -  [`@typescript-eslint/eslint-plugin@3.8.0`](https://npmjs.com/package/@typescript-eslint/eslint-plugin)
         -  [`@typescript-eslint/parser@3.8.0`](https://npmjs.com/package/@typescript-eslint/parser)
         -  [`babel-jest@26.2.2`](https://npmjs.com/package/babel-jest)
         -  [`concurrently@5.2.0`](https://npmjs.com/package/concurrently)
         -  [`copy-webpack-plugin@6.0.3`](https://npmjs.com/package/copy-webpack-plugin)
         -  [`core-js@3.6.5`](https://npmjs.com/package/core-js)
         -  [`cross-env@7.0.2`](https://npmjs.com/package/cross-env)
         -  [`css-loader@4.2.0`](https://npmjs.com/package/css-loader)
         -  [`eslint-plugin-prettier@3.1.4`](https://npmjs.com/package/eslint-plugin-prettier)
         -  [`eslint-plugin-react-hooks@4.0.8`](https://npmjs.com/package/eslint-plugin-react-hooks)
         -  [`eslint-plugin-react@7.20.5`](https://npmjs.com/package/eslint-plugin-react)
         -  [`eslint@7.6.0`](https://npmjs.com/package/eslint)
         -  [`global-agent@2.1.12`](https://npmjs.com/package/global-agent)
         -  [`globalize-compiler@1.1.1`](https://npmjs.com/package/globalize-compiler)
         -  [`html-webpack-plugin@4.3.0`](https://npmjs.com/package/html-webpack-plugin)
         -  [`http-proxy-middleware@1.0.5`](https://npmjs.com/package/http-proxy-middleware)
         -  [`jest@26.2.2`](https://npmjs.com/package/jest)
         -  [`node-dev@5.1.0`](https://npmjs.com/package/node-dev)
         -  [`prettier@2.0.5`](https://npmjs.com/package/prettier)
         -  [`pug@3.0.0`](https://npmjs.com/package/pug)
         -  [`serve@11.3.2`](https://npmjs.com/package/serve)
         -  [`simple-update-in@2.2.0`](https://npmjs.com/package/simple-update-in)
         -  [`source-map-loader@1.0.1`](https://npmjs.com/package/source-map-loader)
         -  [`terser-webpack-plugin@3.1.0`](https://npmjs.com/package/terser-webpack-plugin)
         -  [`typescript@3.9.7`](https://npmjs.com/package/typescript)
         -  [`webpack-cli@3.3.12`](https://npmjs.com/package/webpack-cli)
         -  [`webpack-stats-plugin@0.3.2`](https://npmjs.com/package/webpack-stats-plugin)
         -  [`webpack@4.44.1`](https://npmjs.com/package/webpack)
   -  Production dependencies
      -  [`@babel/plugin-proposal-async-generator-functions@7.10.5`](https://npmjs.com/package/@babel/plugin-proposal-async-generator-functions)
      -  [`@babel/runtime@7.11.0`](https://npmjs.com/package/@babel/runtime)
      -  [`@babel/standalone@7.11.0`](https://npmjs.com/package/@babel/standalone)
      -  [`abort-controller-es5@1.2.0`](https://npmjs.com/package/abort-controller-es5)
      -  [`botframework-directlinejs@0.13.0`](https://npmjs.com/package/botframework-directlinejs)
      -  [`core-js@3.6.5`](https://npmjs.com/package/core-js)
      -  [`event-iterator@2.0.0`](https://npmjs.com/package/event-iterator)
      -  [`event-target-shim-es5@1.2.0`](https://npmjs.com/package/event-target-shim-es5)
      -  [`expect@25.5.0`](https://npmjs.com/package/expect)
      -  [`globalize@1.5.0`](https://npmjs.com/package/globalize)
      -  [`markdown-it-attrs-es5@1.2.0`](https://npmjs.com/package/markdown-it-attrs-es5)
      -  [`markdown-it-attrs@3.0.3`](https://npmjs.com/package/markdown-it-attrs)
      -  [`markdown-it@11.0.0`](https://npmjs.com/package/markdown-it)
      -  [`math-random@2.0.0`](https://npmjs.com/package/math-random)
      -  [`memoize-one@5.1.1`](https://npmjs.com/package/memoize-one)
      -  [`on-error-resume-next@1.1.0`](https://npmjs.com/package/on-error-resume-next)
      -  [`p-defer-es5@1.2.1`](https://npmjs.com/package/p-defer-es5)
      -  [`react-say@2.0.1`](https://npmjs.com/package/react-say)
      -  [`sanitize-html@1.27.2`](https://npmjs.com/package/sanitize-html)
      -  [`simple-update-in@2.2.0`](https://npmjs.com/package/simple-update-in)
      -  [`url-search-params-polyfill@8.1.0`](https://npmjs.com/package/url-search-params-polyfill)
      -  [`web-speech-cognitive-services@7.0.1`](https://npmjs.com/package/web-speech-cognitive-services)
      -  [`whatwg-fetch@3.2.0`](https://npmjs.com/package/whatwg-fetch)

### Added

-  Resolves [#3250](https://github.com/microsoft/BotFramework-WebChat/issues/3250). Added activity grouping feature, by [@compulim](https://github.com/compulim), in PR [#3365](https://github.com/microsoft/BotFramework-WebChat/pull/3365)
-  Resolves [#3354](https://github.com/microsoft/BotFramework-WebChat/issues/3354). Added access key (<kbd>ALT</kbd> + <kbd>SHIFT</kbd> + <kbd>A</kbd> for Windows and <kbd>CTRL</kbd> + <kbd>OPTION</kbd> + <kbd>A</kbd> for Mac) to suggested actions, by [@compulim](https://github.com/compulim), in PR [#3367](https://github.com/microsoft/BotFramework-WebChat/pull/3367)
-  Resolves [#3247](https://github.com/microsoft/BotFramework-WebChat/issues/3247). Support activity ID on `useObserveScrollPosition` and `useScrollTo` hook, by [@compulim](https://github.com/compulim), in PR [#3372](https://github.com/microsoft/BotFramework-WebChat/pull/3372)
-  Added support for [Redux DevTools](https://github.com/zalmoxisus/redux-devtools-extension), by [@tpdewolf](https://github.com/tpdewolf) and [@compulim](https://github.com/compulim), in PR [#3277](https://github.com/microsoft/BotFramework-WebChat/pull/3277)
-  Resolves [#3249](https://github.com/microsoft/BotFramework-WebChat/issues/3249). Convert typed emoticons into Emoji, by [@corinagum](https://github.com/corinagum) and [@compulim](https://github.com/compulim), in PR [#3405](https://github.com/microsoft/BotFramework-WebChat/pull/3405)

### Fixed

-  Fixes [#2675](https://github.com/microsoft/BotFramework-WebChat/issues/2675). Added alt text to images in suggested actions, by [@compulim](https://github.com/compulim) in PR [#3375](https://github.com/microsoft/BotFramework-WebChat/pull/3375)
-  Fixes [#3383](https://github.com/microsoft/BotFramework-WebChat/issues/3383). Fixed notification toast should not break when most fields are `undefined`, by [@compulim](https://github.com/compulim) in PR [#3384](https://github.com/microsoft/BotFramework-WebChat/issues/3384)

### Samples

-  Fixes [#2828](https://github.com/microsoft.com/BotFramework-WebChat/issues/2828). Updated [`04.api/h.clear-after-idle` sample](https://microsoft.github.io/BotFramework-WebChat/04.api/h.clear-after-idle/), by [@compulim](https://github.com/compulim), in PR [#3376](https://github.com/microsoft/BotFramework-WebChat/pull/3376)
-  Added custom Emoji set sample, by [@corinagum](https://github.com/corinagum), in PR [#3405](https://github.com/microsoft/BotFramework-WebChat/pull/3405)

## [4.9.2] - 2020-07-14

### Added

-  Resolves [#3182](https://github.com/microsoft/BotFramework-WebChat/issues/3182). Added stacked suggested actions height properties, by [@corinagum](https://github.com/corinagum), in PR [#3235](https://github.com/microsoft/BotFramework-WebChat/pull/3235)
-  Localized strings in Cantonese (`yue`), by [@compulim](https://github.com/compulim), in PR [#3289](https://github.com/microsoft/BotFramework-WebChat/pull/3289)

### Fixed

-  Fixes [#3265](https://github.com/microsoft/BotFramework-WebChat/issues/3265). Fix styling specificity regression on microphone button, by [@corinagum](https://github.com/corinagum) in PR [#3276](https://github.com/microsoft/BotFramework-WebChat/pull/3276)
-  Fixes [#3279](https://github.com/microsoft/BotFramework-WebChat/issues/3279). Fix relative timestamp errored out when showing a time before yesterday, by [@compulim](https://github.com/compulim) in PR [#3282](https://github.com/microsoft/BotFramework-WebChat/pull/3282)
-  Fixes [#3236](https://github.com/microsoft/BotFramework-WebChat/issues/3236), by [@compulim](https://github.com/compulim) in PR [#3287](https://github.com/microsoft/BotFramework-WebChat/pull/3287)
   -  Isolated screen reader only live region for incoming activities and added a new `<ScreenReaderActivity>` component
   -  Removed screen reader text for activities outside of live region, including `<CarouselFilmstrip>`, `<StackedLayout>`, `<TextContent>`, and `<Timestamp>`
   -  Updated some accessibility texts
   -  Rectified activities render order by delaying activities with `replyToId` that reference an activity which is not ACK-ed, for up to 5 seconds
   -  Disabled widgets will have `tabindex="-1"` set, instead of `disabled` attribute
   -  Remove `tabindex="-1"` from Adaptive Cards container
   -  Hide activities of type `invoke`
-  Fixes [#3294](https://github.com/microsoft/BotFramework-WebChat/issues/3294). Fix blank screen on missing middlewares, by [@compulim](https://github.com/compulim) in PR [#3295](https://github.com/microsoft/BotFramework-WebChat/pull/3295)
-  Fixes [#3297](https://github.com/microsoft/BotFramework-WebChat/issues/3297). Fix `className` prop is not honored in `<ReactWebChat>`, by [@compulim](https://github.com/compulim) in PR [#3300](https://github.com/microsoft/BotFramework-WebChat/pull/3300)

### Samples

-  Resolves [#3218](https://github.com/microsoft/BotFramework-WebChat/issues/3218) and [#2811](https://github.com/microsoft/BotFramework-WebChat/issues/2811). Adds documentation on reconnecting to a conversation in minimizable sample, by [@corinagum](https://github.com/corinagum), in PR [#3239](https://github.com/microsoft/BotFramework-WebChat/pull/3239)
-  Resolves [#2939](https://github.com/microsoft/BotFramework-WebChat/issues/2939). Sample for activity grouping, by [@compulim](https://github.com/compulim), in PR [#3415](https://github.com/microsoft/BotFramework-WebChat/pull/3415)

### [4.9.1] - 2020-06-09

### Breaking changes

-  Affecting Adaptive Cards, legacy cards and suggested actions
   -  For `openUrl` card action, we are now allow-listing the URL scheme using the same allow list from the default Markdown + sanitize engine, which includes `data`, `http`, `https`, `ftp`, `mailto`, `sip`, and `tel`
   -  To allow-list a different set of URL schemes, please implement the card action middleware to override this behavior

### Added

-  Resolves [#3205](https://github.com/microsoft/BotFramework-WebChat/issues/3205). Added Direct Line App Service Extension protocol, by [@compulim](https://github.com/compulim) in PR [#3206](https://github.com/microsoft/BotFramework-WebChat/pull/3206)
-  Resolves [#3225](https://github.com/microsoft/BotFramework-WebChat/issues/3225). Support allowed scheme with `openUrl` card action, by [@compulim](https://github.com/compulim) in PR [#3226](https://github.com/microsoft/BotFramework-WebChat/pull/3226)
-  Resolves [#3252](https://github.com/microsoft/BotFramework-WebChat/issues/3252). Added `useObserveScrollPosition` and `useScrollTo` hooks, by [@compulim](https://github.com/compulim) in PR [#3268](https://github.com/microsoft/BotFramework-WebChat/pull/3268)
-  Resolves [#3271](https://github.com/microsoft/BotFramework-WebChat/issues/3252). Added composition mode, which splits up `<ReactWebChat>` into `<Composer>` and `<BasicWebChat>`, by [@compulim](https://github.com/compulim) in PR [#3268](https://github.com/microsoft/BotFramework-WebChat/pull/3268)

### Fixed

-  Fixes [#1340](https://github.com/microsoft/BotFramework-WebChat/issues/1340). Card container should not be focusable if they do not have `tapAction`, by [@compulim](https://github.com/compulim) in PR [#3193](https://github.com/microsoft/BotFramework-WebChat/pull/3193)
-  Fixed [#3196](https://github.com/microsoft/BotFramework-WebChat/issues/3196). Cards with `tapAction` should be executable by <kbd>ENTER</kbd> or <kbd>SPACEBAR</kbd> key, by [@compulim](https://github.com/compulim) in PR [#3197](https://github.com/microsoft/BotFramework-WebChat/pull/3197)
-  Fixed [#3203](https://github.com/microsoft/BotFramework-WebChat/issues/3203). "New messages" button should be narrated by assistive technology, by [@compulim](https://github.com/compulim) in PR [#3204](https://github.com/microsoft/BotFramework-WebChat/pull/3204)
-  Fixed [#3217](https://github.com/microsoft/BotFramework-WebChat/issues/3217). Make sure `rel="noopener noreferrer` is not sanitized, by [@compulim](https://github.com/compulim) in PR [#3220](https://github.com/microsoft/BotFramework-WebChat/pull/3220)
-  Fixed [#3223](https://github.com/microsoft/BotFramework-WebChat/issues/3223). Tap an `openUrl` card action should open URL in a new tab with `noopener noreferrer` set, by [@compulim](https://github.com/compulim) in PR [#3224](https://github.com/microsoft/BotFramework-WebChat/pull/3224)

### Changed

-  Bumped Adaptive Cards dependencies, by [@compulim](https://github.com/compulim) in PR [#3193](https://github.com/microsoft/BotFramework-WebChat/pull/3193)
   -  [`adaptivecards@1.2.6`](https://npmjs.com/package/adaptivecards)
-  Bumped dependencies due to [a bug in Babel and Node.js](https://github.com/nodejs/node/issues/32852), by [@compulim](https://github.com/compulim) in PR [#3177](https://github.com/microsoft/BotFramework-WebChat/pull/3177)
   -  Development dependencies
      -  [`@babel/preset-env@7.10.0`](https://npmjs.com/package/@babel/preset-env)
   -  Production dependencies
      -  [`abort-controller-es5@1.1.0`](https://npmjs.com/package/abort-controller-es5)
      -  [`event-target-shim-es5@1.1.0`](https://npmjs.com/package/event-target-shim-es5)
      -  [`markdown-it-attrs-es5@1.1.0`](https://npmjs.com/package/markdown-it-attrs-es5)
      -  [`p-defer-es5@1.1.0`](https://npmjs.com/package/p-defer-es5)
      -  [`web-speech-cognitive-services@7.0.0`](https://npmjs.com/package/web-speech-cognitive-services)
-  Updated localization strings for Estonian (Estonia) (`et-EE`), by [@LiweiMa](https://github.com/LiweiMa) in PR [#3183](https://github.com/microsoft/BotFramework-WebChat/pull/3183)
-  Bumped [`botframework-directlinejs@0.12.0`](https://npmjs.com/package/botframework-directlinejs), by [@compulim](https://github.com/compulim) in PR [#3206](https://github.com/microsoft/BotFramework-WebChat/pull/3206)

### Samples

-  Resolves [#3205](https://github.com/microsoft/BotFramework-WebChat/issues/3205). Added [Direct Line App Service Extension chat adapter](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/i.protocol-direct-line-app-service-extension) sample, by [@compulim](https://github.com/compulim) in PR [#3206](https://github.com/microsoft/BotFramework-WebChat/pull/3206)
-  Resolves [#3271](https://github.com/microsoft/BotFramework-WebChat/issues/3252). Added [enable composition mode](https://microsoft.github.io/BotFramework-WebChat/04.api/m.enable-composition-mode) sample, by [@compulim](https://github.com/compulim) in PR [#3268](https://github.com/microsoft/BotFramework-WebChat/pull/3268)
-  Resolves [#3252](https://github.com/microsoft/BotFramework-WebChat/issues/3252). Added [save and restore scroll position](https://microsoft.github.io/BotFramework-WebChat/04.api/n.save-restore-scroll-position) sample, by [@compulim](https://github.com/compulim) in PR [#3268](https://github.com/microsoft/BotFramework-WebChat/pull/3268)
-  Resolves [#3271](https://github.com/microsoft/BotFramework-WebChat/issues/3252). Updated [post activity event](https://microsoft.github.io/BotFramework-WebChat/04.api/d.post-activity-event) sample to use composition mode, by [@compulim](https://github.com/compulim) in PR [#3268](https://github.com/microsoft/BotFramework-WebChat/pull/3268)

## [4.9.0] - 2020-05-11

### Added

-  Resolves [#2897](https://github.com/microsoft/BotFramework-WebChat/issues/2897). Moved from JUnit to VSTest reporter with file attachments, by [@compulim](https://github.com/compulim) in PR [#2990](https://github.com/microsoft/BotFramework-WebChat/pull/2990)
-  Added `aria-label` attribute support for default Markdown engine, by [@patniko](https://github.com/patniko) in PR [#3022](https://github.com/microsoft/BotFramework-WebChat/pull/3022)
-  Resolves [#2969](https://github.com/microsoft/BotFramework-WebChat/issues/2969). Support sovereign cloud for Cognitive Services Speech Services, by [@compulim](https://github.com/compulim) in PR [#3040](https://github.com/microsoft/BotFramework-WebChat/pull/3040)
-  Resolves [#2481](https://github.com/microsoft/BotFramework-WebChat/issues/2481). Support selecting different audio input devices for Cognitive Services Speech Services, by [@compulim](https://github.com/compulim) in PR [#3079](https://github.com/microsoft/BotFramework-WebChat/pull/3079)
-  Resolves [#2850](https://github.com/microsoft/BotFramework-WebChat/issues/2850). Added new `useFocus` hook and deprecating `useFocusSendBox` hook, by [@compulim](https://github.com/compulim) in PR [#3123](https://github.com/microsoft/BotFramework-WebChat/pull/3123)
   -  Modify `setFocus` argument of `useTextBoxSubmit` to support `main` and `sendBoxWithoutKeyboard`
-  Fixes [#1427](https://github.com/microsoft/BotFramework-WebChat/issues/1427). Support `disabled` prop and added `actionPerformedClassName` in Adaptive Card and other legacy cards, by [@compulim](https://github.com/compulim) in PR [#3150](https://github.com/microsoft/BotFramework-WebChat/issue/3150)

### Fixed

-  Fixes [#2989](https://github.com/microsoft/BotFramework-WebChat/issues/2989). Fix `observeOnce` to use ES Observable call pattern, by [@compulim](https://github.com/compulim) in PR [#2993](https://github.com/microsoft/BotFramework-WebChat/pull/2993)
-  Fixes [#3024](https://github.com/microsoft/BotFramework-WebChat/issues/3024). Using bridge package [`markdown-it-attrs-es5`](https://npmjs.com/package/markdown-it-attrs-es5) for consuming [`markdown-it-attrs`](https://npmjs.com/package/markdown-it-attrs) for IE11, by [@compulim](https://github.com/compulim) in PR [#3025](https://github.com/microsoft/BotFramework-WebChat/pull/3025)
-  Fixes [#2818](https://github.com/microsoft/BotFramework-WebChat/issues/2818). Fix user ID is not set when passing to embed as query parameter, by [@p-nagpal](https://github.com/p-nagpal) in PR [#3031](https://github.com/microsoft/BotFramework-WebChat/pull/3031)
-  Fixes [#3026](https://github.com/microsoft/BotFramework-WebChat/issues/3026). Fix link `rel` attribute in the `renderMarkdown` function, by [@tdurnford](https://github.com/tdurnford) in PR [#3033](https://github.com/microsoft/BotFramework-WebChat/pull/3033)
-  Fixes [#2933](https://github.com/microsoft/BotFramework-WebChat/issues/2933). Fix `text` should not be ignored in `messageBack` action in hero card, by [@geea-develop](https://github.com/geea-develop) and [@compulim](https://github.com/compulim) in PR [#3003](https://github.com/microsoft/BotFramework-WebChat/pull/3003)
-  Fixes [#2562](https://github.com/microsoft/BotFramework-WebChat/issues/2562). Fix timestamps should not stop updating, by [@compulim](https://github.com/compulim) in PR [#3066](https://github.com/microsoft/BotFramework-WebChat/pull/3066)
-  Fixes [#2953](https://github.com/microsoft/BotFramework-WebChat/issues/2953). Direct Line Speech should not synthesize when the `speak` property is falsy, by [@compulim](https://github.com/compulim) in PR [#3059](https://github.com/microsoft/BotFramework-WebChat/pull/3059)
-  Fixes [#2876](https://github.com/microsoft/BotFramework-WebChat/issues/2876). `messageBack` and `postBack` should send even if both `text` and `value` is falsy or `undefined`, by [@compulim](https://github.com/compulim) in PR [#3120](https://github.com/microsoft/BotFramework-WebChat/issues/3120)
-  Fixes [#2668](https://github.com/microsoft/BotFramework-WebChat/issues/2668). Disable Web Audio on insecure connections, by [@compulim](https://github.com/compulim) in PR [#3079](https://github.com/microsoft/BotFramework-WebChat/pull/3079)
-  Fixes [#2850](https://github.com/microsoft/BotFramework-WebChat/issues/2850). After click suggested action, should focus to send box without keyboard, by [@compulim](https://github.com/compulim) in PR [#3123](https://github.com/microsoft/BotFramework-WebChat/pull/3123)
-  Fixes [#3133](https://github.com/microsoft/BotFramework-WebChat/issues/3133). Associate ARIA labels with buttons in hero card and Adaptive Cards, by [@compulim](https://github.com/compulim) in PR [#3146](https://github.com/microsoft/BotFramework-WebChat/pull/3146).
   -  Remove browser-based detection from `<ScreenReaderText>` because it is no longer needed.
   -  After stripping Markdown syntax for accessibility labels, cache the result to improve rendering performance.
   -  Skip stripping Markdown for non-Markdown text content.
-  Fixes [#3155](https://github.com/microsoft/BotFramework-WebChat/issues/3155). Patch incoming activities with null fields, by [@compulim](https://github.com/compulim) in PR [#3154](https://github.com/microsoft/BotFramework-WebChat/pull/3154)
-  Fixes [#2669](https://github.com/microsoft/BotFramework-WebChat/issues/2669) and [#3136](https://github.com/microsoft/BotFramework-WebChat/issues/3136). The "New messages" button will be accessible through <kbd>TAB</kbd> key, inbetween the last read and first unread activity, by [@compulim](https://github.com/compulim) in PR [#3150](https://github.com/microsoft/BotFramework-WebChat/issues/3150).
   -  After the "New message" button is clicked, focus will be moved to the first interactive UI of unread activity or the send box.
-  Fixes [#3135](https://github.com/microsoft/BotFramework-WebChat/issues/3135). If the current widget is disabled, it will keep focus until the next <kbd>TAB</kbd> key is pressed, by [@compulim](https://github.com/compulim) in PR [#3150](https://github.com/microsoft/BotFramework-WebChat/pull/3150)

### Changed

-  Bumped all dependencies to the latest versions, by [@compulim](https://github.com/compulim) in PR [#2985](https://github.com/microsoft/BotFramework-WebChat/pull/2985), [#3012](https://github.com/microsoft/BotFramework-WebChat/pull/3012) and [#3150](https://github.com/microsoft/BotFramework-WebChat/pull/3150)
   -  Development dependencies
      -  Root package
         -  [`@azure/storage-blob@12.1.0`](https://npmjs.com/package/@azure/storage-blob)
         -  [`@babel/plugin-proposal-class-properties@7.8.3`](https://npmjs.com/package/@babel/plugin-proposal-class-properties)
         -  [`@babel/plugin-proposal-object-rest-spread@7.8.3`](https://npmjs.com/package/@babel/plugin-proposal-object-rest-spread)
         -  [`@babel/plugin-transform-runtime@7.8.3`](https://npmjs.com/package/@babel/plugin-transform-runtime)
         -  [`@babel/preset-env@7.8.7`](https://npmjs.com/package/@babel/preset-env)
         -  [`@babel/preset-react@7.8.3`](https://npmjs.com/package/@babel/preset-react)
         -  [`@babel/preset-typescript@7.8.3`](https://npmjs.com/package/@babel/preset-typescript)
         -  [`@babel/runtime@7.8.7`](https://npmjs.com/package/@babel/runtime)
         -  [`babel-jest@25.1.0`](https://npmjs.com/package/babel-jest)
         -  [`concurrently@5.1.0`](https://npmjs.com/package/concurrently)
         -  [`core-js@3.6.4`](https://npmjs.com/package/core-js)
         -  [`cross-env@7.0.2`](https://npmjs.com/package/cross-env)
         -  [`get-port@5.1.1`](https://npmjs.com/package/get-port)
         -  [`husky@4.2.3`](https://npmjs.com/package/husky)
         -  [`jest@25.1.0`](https://npmjs.com/package/jest)
         -  [`jest-image-snapshot@2.12.0`](https://npmjs.com/package/jest-image-snapshot)
         -  [`lerna@3.20.2`](https://npmjs.com/package/lerna)
         -  [`lint-staged@10.1.1`](https://npmjs.com/package/lint-staged)
         -  [`selenium-webdriver@4.0.0-alpha.7`](https://npmjs.com/package/selenium-webdriver)
      -  Other packages
         -  [`@babel/core@7.8.7`](https://npmjs.com/package/@babel/core)
         -  [`@babel/preset-env@7.8.7`](https://npmjs.com/package/@babel/preset-env)
         -  [`babel-jest@25.1.0`](https://npmjs.com/package/babel-jest)
         -  [`babel-plugin-istanbul@6.0.0`](https://npmjs.com/package/babel-plugin-istanbul)
         -  [`concurrently@5.1.0`](https://npmjs.com/package/concurrently)
         -  [`eslint-plugin-prettier@3.1.2`](https://npmjs.com/package/eslint-plugin-prettier)
         -  [`eslint-plugin-react-hooks@2.5.0`](https://npmjs.com/package/eslint-plugin-react-hooks)
         -  [`eslint-plugin-react@7.18.3`](https://npmjs.com/package/eslint-plugin-react)
         -  [`eslint@6.8.0`](https://npmjs.com/package/eslint)
         -  [`terser-webpack-plugin@2.3.5`](https://npmjs.com/package/terser-webpack-plugin)
         -  [`typescript@3.8.3`](https://npmjs.com/package/typescript)
         -  [`webpack-cli@3.3.11`](https://npmjs.com/package/webpack-cli)
         -  [`webpack-stats-plugin@0.3.1`](https://npmjs.com/package/webpack-stats-plugin)
         -  [`webpack@4.42.0`](https://npmjs.com/package/webpack)
   -  Production dependencies
      -  `core`
         -  [`@babel/runtime@7.8.7`](https://npmjs.com/package/@babel/runtime)
         -  [`redux-saga@1.1.3`](https://npmjs.com/package/redux-saga)
      -  `bundle`
         -  [`@babel/runtime@7.8.7`](https://npmjs.com/package/@babel/runtime)
         -  [`core-js@3.6.4`](https://npmjs.com/package/core-js)
         -  [`url-search-params-polyfill@8.0.0`](https://npmjs.com/package/url-search-params-polyfill)
      -  `component`
         -  [`react-film@2.1.0`](https://npmjs.com/package/react-film)
         -  [`react-redux@7.2.0`](https://npmjs.com/package/react-redux)
         -  [`react-scroll-to-bottom@2.0.0`](https://npmjs.com/package/react-scroll-to-bottom)
         -  [`redux@4.0.5`](https://npmjs.com/package/redux)
      -  `directlinespeech`
         -  [`@babel/runtime@7.8.7`](https://npmjs.com/package/@babel/runtime)
         -  [`core-js@3.6.4`](https://npmjs.com/package/core-js)
      -  `embed`
         -  [`@babel/runtime@7.8.7`](https://npmjs.com/package/@babel/runtime)
         -  [`core-js@3.6.4`](https://npmjs.com/package/core-js)
-  Bumped Chrome Docker image to `3.141.59-zirconium` (Chrome 80.0.3987.106), by [@compulim](https://github.com/compulim) in PR [#2992](https://github.com/microsoft/BotFramework-WebChat/pull/2992)
-  Added `4.8.0` to `embed/servicingPlan.json`, by [@compulim](https://github.com/compulim) in PR [#2986](https://github.com/microsoft/BotFramework-WebChat/pull/2986)
-  Bumped `microsoft-cognitiveservices-speech-sdk@1.10.1` and `web-speech-cognitive-services@6.1.0`, by [@compulim](https://github.com/compulim) in PR [#3040](https://github.com/microsoft/BotFramework-WebChat/pull/3040)
-  Resolved [#2886](https://github.com/microsoft/BotFramework-WebChat/issues/2886) and [#2987](https://github.com/microsoft/BotFramework-WebChat/issue/2987), converged all references of [`microsoft-cognitiveservices-speech-sdk`](https://npmjs.com/package/microsoft-cognitiveservices-speech-sdk) to reduce footprint, by [@compulim](https://github.com/compulim) in PR [#3079](https://github.com/microsoft/BotFramework-WebChat/pull/3079)

### Samples

-  Resolves [#2806](https://github.com/microsoft/BotFramework-WebChat/issues/2806), added [Single sign-on with On Behalf Of Token Authentication](https://webchat-sample-obo.azurewebsites.net/) sample, by [@tdurnford](https://github.com/tdurnford) in [#2865](https://github.com/microsoft/BotFramework-WebChat/pull/2865)
-  Resolves [#2481](https://github.com/microsoft/BotFramework-WebChat/issues/2481), added selectable audio input device sample, by [@compulim](https://github.com/compulim) in PR [#3079](https://github.com/microsoft/BotFramework-WebChat/pull/3079)
-  Resolves [#1427](https://github.com/microsoft/BotFramework-WebChat/issues/1427), added disable cards after submission sample, by [@compulim](https://github.com/compulim) in PR [#3150](https://github.com/microsoft/BotFramework-WebChat/issue/3150)

## [4.8.1] - 2020-04-15

### Fixed

-  Fixes [#3075](https://github.com/microsoft/BotFramework-WebChat/issues/3075). Fix usability issues around accessibility, by [@compulim](https://github.com/compulim) in PR [#3076](https://github.com/microsoft/BotFramework-WebChat/pull/3076)
   -  Fix timestamp should not be narrated more than once.
   -  Associate the activity text with its attachments, by adding a `role="region"` to the activity DOM element.
-  Fixes [#3074](https://github.com/microsoft/BotFramework-WebChat/issues/3074). Keep `props.locale` when sending to the bot, by [@compulim](https://github.com/compulim) in PR [#3095](https://github.com/microsoft/BotFramework-WebChat/pull/3095)
-  Fixes [#3096](https://github.com/microsoft/BotFramework-WebChat/issues/3096). Use `<ScreenReaderText>` instead of `aria-label` for message bubbles, by [@compulim](https://github.com/compulim) in PR [#3097](https://github.com/microsoft/BotFramework-WebChat/pull/3097)

## [4.8.0] - 2020-03-05

### Breaking changes

-  Localization
   -  `locale` prop: `zh-YUE` has been renamed to `yue` to conform with Unicode standard. `zh-YUE` will continue to work with warnings
   -  Most strings have been validated and retranslated by the Microsoft localization team, with the exception of English (US), Egyptian Arabic, Jordan Arabic, and Chinese Yue
      -  If the new strings are undesirable, please use the [`overideLocalizedStrings` prop](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/LOCALIZATION.md#overriding-localization-strings) for customization
      -  String IDs have been refreshed and now use a standard format
   -  `useLocalize` and `useLocalizeDate` is deprecated. Please use `useLocalizer` and `useDateFormatter` instead
-  Customizable typing indicator: data and hook related to typing indicator are being revamped in PR [#2912](https://github.com/microsoft/BotFramework-WebChat/pull/2912)
   -  `lastTypingAt` reducer is deprecated, use `typing` instead. The newer reducer contains typing indicator from the user
   -  `useLastTypingAt()` hook is deprecated, use `useActiveTyping(duration?: number)` instead. For all typing information, pass `Infinity` to `duration` argument
-  Customizable activity status: new `nextVisibleActivity` to control activity status visibility
   -  Previously, we use `timestampClassName` to control if the activity should show or hide timestamp. The `timestampClassName` was added as a `class` attribute the DOM element which contains the timestamp
   -  Today, `activity` and `nextVisibleActivity` are passed to the middleware, so the `activityRendererMiddleware` can decide whether the timestamp should be shown or not. For example, developers can group timestamp based on activity type

### Added

-  Resolves [#2753](https://github.com/microsoft/BotFramework-WebChat/issues/2753). Added support for updating an activity by the ID, by [@compulim](https://github.com/compulim) in PR [#2825](https://github.com/microsoft/BotFramework-WebChat/pull/2825)
-  Added custom hooks - `useTimer` and `useIntervalSince` - to replace the headless `Timer` component, by [@tdurnford](https://github.com/tdurnford), in PR [#2771](https://github.com/microsoft/BotFramework-WebChat/pull/2771)
-  Resolves [#2720](https://github.com/microsoft/BotFramework-WebChat/issues/2720), added customizable activity status using `activityStatusMiddleware` props, by [@compulim](https://github.com/compulim), in PR [#2788](https://github.com/microsoft/BotFramework-WebChat/pull/2788)
-  Added default `onError` prop to the `Dictation` component, by [@tonyanziano](https://github.com/tonyanziano), in PR [#2866](https://github.com/microsoft/BotFramework-WebChat/pull/2866)
-  Resolves [#1976](https://github.com/microsoft/BotFramework-WebChat/issues/1976). Added RTL support with localization for Hebrew and Arabic, by [@corinagum](https://github.com/corinagum), in PR [#2890](https://github.com/microsoft/BotFramework-WebChat/pull/2890)
-  Resolves [#2755](https://github.com/microsoft/BotFramework-WebChat/issues/2755). Added notification system and toast UI, by [@compulim](https://github.com/compulim), in PR [#2883](https://github.com/microsoft/BotFramework-WebChat/pull/2883)
   -  Please read [this article on how to use notification](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/NOTIFICATION.md)
   -  Slow connection timer can now be set using `styleOptions.slowConnectionAfter` (in milliseconds)
-  Resolves [#2871](https://github.com/microsoft/BotFramework-WebChat/issues/2871). Moved typing indicator to transcript, by [@compulim](https://github.com/compulim), in PR [#2883](https://github.com/microsoft/BotFramework-WebChat/pull/2883)
-  Resolves [#2756](https://github.com/microsoft/BotFramework-WebChat/issues/2756). Improved localizability and add override support for localized strings, by [@compulim](https://github.com/compulim) in PR [#2894](https://github.com/microsoft/BotFramework-WebChat/pull/2894)
   -  Will be translated into 44 languages, plus 2 community-contributed translations
   -  For details, please read the [documentation on the localization](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/LOCALIZATION.md)
-  Resolves [#2213](https://github.com/microsoft/BotFramework-WebChat/issues/2213). Added customization for typing activity, by [@compulim](https://github.com/compulim), in PR [#2912](https://github.com/microsoft/BotFramework-WebChat/pull/2912)
-  Resolves [#2754](https://github.com/microsoft/BotFramework-WebChat/issues/2754). Added [telemetry system](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/TELEMETRY.md), by [@compulim](https://github.com/compulim), in PR [#2922](https://github.com/microsoft/BotFramework-WebChat/pull/2922)
-  Resolves [#2857](https://github.com/microsoft/BotFramework-WebChat/issues/2857). Added the ability to customize the avatar on a per activity basis, by [@compulim](https://github.com/compulim), in PR [#2943](https://github.com/microsoft/BotFramework-WebChat/pull/2943)
-  Resolves [#2944](https://github.com/microsoft/BotFramework-WebChat/issues/2944). Updated Azure locale mapping in embed page, by [@compulim](https://github.com/compulim) in PR [#2965](https://github.com/microsoft/BotFramework-WebChat/pull/2965)

### Fixed

-  Fixes [#2611](https://github.com/microsoft/BotFramework-WebChat/issues/2611). Fix sample 21: hooks errors, by [@corinagum](https://github.com/corinagum) in PR [#2740](https://github.com/microsoft/BotFramework-WebChat/pull/2740)
-  Fixes [#2609](https://github.com/microsoft/BotFramework-WebChat/issues/2609). Fix sample 12: minimizable button is causing another reconnect on restore, by [@compulim](https://github.com/compulim) in PR [#2758](https://github.com/microsoft/BotFramework-WebChat/pull/2758)
-  Fixes [#2773](https://github.com/microsoft/BotFramework-WebChat/issues/2773). Import ES5 version of the following bundles, by [@compulim](https://github.com/compulim) in PR [#2774](https://github.com/microsoft/BotFramework-WebChat/pull/2773)
   -  [`abort-controller`](https://npmjs.com/package/abort-controller)
   -  [`event-target-shim`](https://npmjs.com/package/event-target-shim)
   -  [`p-defer`](https://npmjs.com/package/p-defer)
-  Fixes the following issues and improves test reliability, by [@compulim](https://github.com/compulim) in PR [#2777](https://github.com/microsoft/BotFramework-WebChat/pull/2777)
   -  Fixes [#2612](https://github.com/microsoft/BotFramework-WebChat/issues/2612). Wait until language change
   -  Fixes [#2653](https://github.com/microsoft/BotFramework-WebChat/issues/2653). Scroll-to-bottom check will do 5 consecutive checks to determine stickiness.
   -  Fixes [#2691](https://github.com/microsoft/BotFramework-WebChat/issues/2691). Wait until button is shown/hid before taking screenshot
   -  Fixes [#2737](https://github.com/microsoft/BotFramework-WebChat/issues/2737). Use `driver.wait` for conditions
   -  Fixes [#2776](https://github.com/microsoft/BotFramework-WebChat/issues/2776). Wait until button is shown/hid before taking screenshot
   -  Use a new timeout `fetchImage` for images
-  Fixes [#2780](https://github.com/microsoft/BotFramework-WebChat/issues/2780). Added the `tel` protocol to the `allowedSchema` in the `sanitize-html` options, by [@tdurnford](https://github.com/tdurnford) in PR [#2787](https://github.com/microsoft/BotFramework-WebChat/pull/2787)
-  Fixes [#2747](https://github.com/microsoft/BotFramework-WebChat/issues/2747). Moved `Timestamp` into the `SendStatus` component and removed the `Timestamp` style set, by [@tdurnford](https://github.com/tdurnford) in PR [#2786](https://github.com/microsoft/BotFramework-WebChat/pull/2786)
-  Fixes [#2647](https://github.com/microsoft/BotFramework-WebChat/issues/2647). Update the `CroppedImage` component `PropType`, by [@tdurnford](https://github.com/tdurnford) in PR [#2795](https://github.com/microsoft/BotFramework-WebChat/pull/2795)
-  Fixes [#2794](https://github.com/microsoft/BotFramework-WebChat/issues/2794). Fix change locale sample, by [@corinagum](https://github.com/corinagum) in PR [#2798](https://github.com/microsoft/BotFramework-WebChat/pull/2798)
-  Fixes [#2510](https://github.com/microsoft/BotFramework-WebChat/issues/2510). Host hybrid-react and clear-after-idle samples, by [@corinagum](https://github.com/corinagum) in PR [#2798](https://github.com/microsoft/BotFramework-WebChat/pull/2798)
-  Fixes [#2772](https://github.com/microsoft/BotFramework-WebChat/issues/2772). Updated Adaptive Cards HostConfig to include container styles, by [@tdurnford](https://github.com/tdurnford) in PR [#2810](https://github.com/microsoft/BotFramework-WebChat/pull/2810)
-  Fixes [#2145](https://github.com/microsoft/BotFramework-WebChat/issues/2145). Updated Adaptive Cards styles to include action styles, by [@tdurnford](https://github.com/tdurnford) in PR [#2810](https://github.com/microsoft/BotFramework-WebChat/pull/2810)
-  Fixes [#2459](https://github.com/microsoft/BotFramework-WebChat/issues/2459). Updated Cognitive Services Speech Services to use latest fetch credentials signature, by [@compulim](https://github.com/compulim) in PR [#2740](https://github.com/microsoft/BotFramework-WebChat/pull/2759)
-  Fixes [#1673](https://github.com/microsoft/BotFramework-WebChat/issues/1673). Configured suggested action and carousel flippers to blur on click, by [@tdunford](https://github.com/tdurnford) in PR [#2801](https://github.com/microsoft/BotFramework-WebChat/pull/2801)
-  Fixes [#2822](https://github.com/microsoft/BotFramework-WebChat/issues/2822). Fixed `credentials` should return `authorizationToken` and `subscriptionKey` as string and allow empty LUIS reference grammar ID, by [@compulim](https://github.com/compulim) in PR [#2824](https://github.com/microsoft/BotFramework-WebChat/pull/2824)
-  Fixes [#2751](https://github.com/microsoft/BotFramework-WebChat/issues/2751). Move documentation to docs folder, by [@corinagum](https://github.com/corinagum) in PR [#2832](https://github.com/microsoft/BotFramework-WebChat/pull/2832)
-  Fixes [#2838](https://github.com/microsoft/BotFramework-WebChat/issues/2838). Fixed `concatMiddleware` should allow any middleware to call its downstream middleware twice, by [@compulim](https://github.com/compulim) in PR [#2839](https://github.com/microsoft/BotFramework-WebChat/pull/2839)
-  Fixes [#2864](https://github.com/microsoft/BotFramework-WebChat/issues/2864). Replaced `DownloadAttachment` and `UploadAttachment` with `FileAttachment`, which shows the download link and icon if the attachment contains the `contentUrl`, by [@compulim](https://github.com/compulim) in PR [#2868](https://github.com/microsoft/BotFramework-WebChat/pull/2868)
-  Fixes [#2877](https://github.com/microsoft/BotFramework-WebChat/issues/2877). Updated Cognitive Services Speech Services samples to use both pre-4.8 and 4.8 API signature, by [@compulim](https://github.com/compulim) in PR [#2916](https://github.com/microsoft/BotFramework-WebChat/pull/2916)
-  Fixes [#2757](https://github.com/microsoft/BotFramework-WebChat/issues/2757). New message indicator should only show up for new messages, by [@compulim](https://github.com/compulim) in PR [#2915](https://github.com/microsoft/BotFramework-WebChat/pull/2915)
-  Fixes [#2945](https://github.com/microsoft/BotFramework-WebChat/issues/2945). Toast should not overlap with each other, by [@compulim](https://github.com/compulim) in PR [#2952](https://github.com/microsoft/BotFramework-WebChat/pull/2952)
-  Fixes [#2946](https://github.com/microsoft/BotFramework-WebChat/issues/2946). Updated JSON filenames for localization strings, by [@compulim](https://github.com/compulim) in PR [#2949](https://github.com/microsoft/BotFramework-WebChat/pull/2949)
-  Fixes [#2560](https://github.com/microsoft/BotFramework-WebChat/issues/2560). Bumped to [`react-dictate-button@1.2.2`](https://npmjs.com/package/react-dictate-button) to workaround [a bug from Angular/zone.js](https://github.com/angular/angular/issues/31750), by [@compulim](https://github.com/compulim) in PR [#2960](https://github.com/microsoft/BotFramework-WebChat/issues/2960)
-  Fixes [#2923](https://github.com/microsoft/BotFramework-WebChat/issues/2923). Added `download` attribute to file attachment (`<FileContent>`), by [@compulim](https://github.com/compulim) in PR [#2963](https://github.com/microsoft/BotFramework-WebChat/pull/2963)
-  Fixes [#2904](https://github.com/microsoft/BotFramework-WebChat/issues/2904). Fixed border radius when rendering bubble nub in RTL, by [@compulim](https://github.com/compulim) in PR [#2943](https://github.com/microsoft/BotFramework-WebChat/pull/2943)
-  Fixes [#2966](https://github.com/microsoft/BotFramework-WebChat/issues/2966). Collapsed toast should show at most 2 lines of text, by [@compulim](https://github.com/compulim) in PR [#2967](https://github.com/microsoft/BotFramework-WebChat/issues/2967)
-  Fixes [#2941](https://github.com/microsoft/BotFramework-WebChat/issues/2941), [#2921](https://github.com/microsoft/BotFramework-WebChat/issues/2921), and [#2948](https://github.com/microsoft/BotFramework-WebChat/issues/2948). Update documentation and fix redux sample, by [@corinagum](https://github.com/corinagum) in PR [#2968](https://github.com/microsoft/BotFramework-WebChat/pull/2968)
-  Fixes [#2972](https://github.com/microsoft/BotFramework-WebChat/issues/2972). Compatibility fix for IE11, by [@compulim](https://github.com/compulim) in PR [#2973](https://github.com/microsoft/BotFramework-WebChat/pull/2973)
-  Fixes [#2977](https://github.com/microsoft/BotFramework-WebChat/issues/2977). `sr-Cyrl` and `sr-Latn` should display Serbian texts, by [@compulim](https://github.com/compulim) in PR [#2978](https://github.com/microsoft/BotFramework-WebChat/pull/2978)
-  Fixes [#2979](https://github.com/microsoft/BotFramework-WebChat/issues/2979). Lock `microsoft-cognitiveservices-speech-sdk` to `1.8.1`, by [@compulim](https://github.com/compulim) in PR [#2980](https://github.com/microsoft/BotFramework-WebChat/pull/2980)

### Changed

-  Bumped all dependencies to latest versions, by [@corinagum](https://github.com/corinagum) in PR [#2740](https://github.com/microsoft/BotFramework-WebChat/pull/2740)
   -  Development dependencies
      -  Root package
         -  `@babel/plugin-proposal-class-properties@7.8.3`
         -  `@babel/plugin-proposal-object-rest-spread@7.8.3`
         -  `@babel/plugin-transform-runtime@7.8.3`
         -  `@babel/preset-env@7.8.4`
         -  `@babel/preset-react@7.8.3`
         -  `@babel/preset-typescript@7.8.3`
         -  `@babel/runtime@7.8.4`
         -  `core-js@3.5.0`
         -  `coveralls@3.0.9`
         -  `husky@3.1.0`
         -  `jest-image-snapshot@2.11.1`
         -  `lerna@3.19.0`
         -  `lint-staged@9.5.0`
      -  Other packages
         -  `@babel/cli@7.8.4`
         -  `@babel/core@7.8.4`
         -  `@babel/plugin-proposal-class-properties@7.8.3`
         -  `@babel/plugin-proposal-object-rest-spread@7.8.3`
         -  `@babel/plugin-transform-runtime@7.8.3`
         -  `@babel/preset-env@7.8.4`
         -  `@babel/preset-react@7.8.3`
         -  `@babel/preset-typescript@7.8.3`
         -  `@types/node@12.12.18`
         -  `@types/react@16.8.25`
         -  `@typescript-eslint/eslint-plugin@2.12.0`
         -  `@typescript-eslint/parser@2.12.0`
         -  `copy-webpack-plugin@5.1.1`
         -  `eslint-plugin-react-hooks@2.3.0`
         -  `eslint-plugin-react@7.17.0`
         -  `eslint@6.7.2`
         -  `http-proxy-middleware@0.20.0`
         -  `terser-webpack-plugin@2.3.0`
         -  `typescript@3.7.3`
         -  `webpack@4.41.3`
   -  Production dependencies
      -  `core`
         -  `math-random@1.0.4`
      -  `bundle`
         -  `@babel/runtime@7.8.4`
         -  `core-js@3.5.0`
         -  `sanitize-html@1.20.0`
      -  `component`
         -  `sanitize-html@1.20.1`
      -  `embed`
         -  `@babel/runtime@7.8.4`
         -  `core-js@3.5.0`
-  Resolves [#2748](https://github.com/microsoft/BotFramework-WebChat/issues/2748), updated build scripts and CI pipeline, by [@compulim](https://github.com/compulim), in PR [#2767](https://github.com/microsoft/BotFramework-WebChat/pull/2767)
-  `component`: Bumps [`react-film@2.0.2`](https://npmjs.com/package/react-film/), by [@tdurnford](https://github.com/tdurnford) in PR [#2801](https://github.com/microsoft/BotFramework-WebChat/pull/2801)
-  Removes `sendTyping` and deprecation notes in PR [#2845](https://github.com/microsoft/BotFramework-WebChat/pull/2845), by [@corinagum](https://github.com/corinagum), in PR [#2918](https://github.com/microsoft/BotFramework-WebChat/pull/2918)
-  `component`: Bumps [`react-dictate-button@1.2.2`](https://npmjs.com/package/react-dictate-button/), by [@compulim](https://github.com/compulim) in PR [#2960](https://github.com/microsoft/BotFramework-WebChat/pull/2960)

### Samples

-  Bump samples to Web Chat 4.7.0, by [@compulim](https://github.com/compulim) in PR [#2726](https://github.com/microsoft/BotFramework-WebChat/issues/2726)
-  Resolves [#2641](https://github.com/microsoft/BotFramework-WebChat/issues/2641). Reorganize Web Chat samples, by [@corinagum](https://github.com/corinagum), in PR [#2762](https://github.com/microsoft/BotFramework-WebChat/pull/2762)
-  Resolves [#2755](https://github.com/microsoft/BotFramework-WebChat/issues/2755), added "how to use notification and customize the toast UI" sample, by [@compulim](https://github.com/compulim), in PR [#2883](https://github.com/microsoft/BotFramework-WebChat/pull/2883)
-  Resolves [#2213](https://github.com/microsoft/BotFramework-WebChat/issues/2213). Added [Customize Typing Indicator Demo](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/j.typing-indicator), by [@compulim](https://github.com/compulim), in PR [#2912](https://github.com/microsoft/BotFramework-WebChat/pull/2912)
-  Resolves [#2754](https://github.com/microsoft/BotFramework-WebChat/issues/2754). Added [telemetry collection using Azure Application Insights](https://microsoft.github.io/BotFramework-WebChat/04.api/k.telemetry-application-insights) and [telemetry collection using Google Analytics](https://microsoft.github.io/BotFramework-WebChat/04.api/l.telemetry-google-analytics), by [@compulim](https://github.com/compulim), in PR [#2922](https://github.com/microsoft/BotFramework-WebChat/pull/2922)
-  Resolves [#2857](https://github.com/microsoft/BotFramework-WebChat/issues/2857). Added [Customize Avatar Demo](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/k.per-message-avatar), by [@compulim](https://github.com/compulim), in PR [#2943](https://github.com/microsoft/BotFramework-WebChat/pull/2943)

## [4.7.1] - 2019-12-13

### Changed

-  Moved `core-js` from dev dependencies to dependencies in `botframework-directlinespeech-sdk` package, by [@tonyanziano](https://github.com/tonyanziano), in PR [#2727](https://github.com/microsoft/BotFramework-WebChat/pull/2727)

## [4.7.0] - 2019-12-12

### Breaking changes

-  `adaptiveCardHostConfig` is being renamed to `adaptiveCardsHostConfig`
   -  If you are using the deprecated `adaptiveCardHostConfig`, we will rename it automatically

### Added

-  Resolves [#2539](https://github.com/microsoft/BotFramework-WebChat/issues/2539), added React hooks for customization, by [@compulim](https://github.com/compulim), in the following PRs:
   -  PR [#2540](https://github.com/microsoft/BotFramework-WebChat/pull/2540): `useActivities`, `useReferenceGrammarID`, `useSendBoxShowInterims`
   -  PR [#2541](https://github.com/microsoft/BotFramework-WebChat/pull/2541): `useStyleOptions`, `useStyleSet`
   -  PR [#2542](https://github.com/microsoft/BotFramework-WebChat/pull/2542): `useLanguage`, `useLocalize`, `useLocalizeDate`
   -  PR [#2543](https://github.com/microsoft/BotFramework-WebChat/pull/2543): `useAdaptiveCardsHostConfig`, `useAdaptiveCardsPackage`, `useRenderMarkdownAsHTML`
   -  PR [#2544](https://github.com/microsoft/BotFramework-WebChat/pull/2544): `useAvatarForBot`, `useAvatarForUser`
   -  PR [#2547](https://github.com/microsoft/BotFramework-WebChat/pull/2547): `useEmitTypingIndicator`, `usePeformCardAction`, `usePostActivity`, `useSendEvent`, `useSendFiles`, `useSendMessage`, `useSendMessageBack`, `useSendPostBack`
   -  PR [#2548](https://github.com/microsoft/BotFramework-WebChat/pull/2548): `useDisabled`
   -  PR [#2549](https://github.com/microsoft/BotFramework-WebChat/pull/2549): `useSuggestedActions`
   -  PR [#2550](https://github.com/microsoft/BotFramework-WebChat/pull/2550): `useConnectivityStatus`, `useGroupTimestamp`, `useTimeoutForSend`, `useUserID`, `useUsername`
   -  PR [#2551](https://github.com/microsoft/BotFramework-WebChat/pull/2551): `useLastTypingAt`, `useSendTypingIndicator`, `useTypingIndicator`
   -  PR [#2552](https://github.com/microsoft/BotFramework-WebChat/pull/2552): `useFocusSendBox`, `useScrollToEnd`, `useSendBoxValue`, `useSubmitSendBox`, `useTextBoxSubmit`, `useTextBoxValue`
   -  PR [#2553](https://github.com/microsoft/BotFramework-WebChat/pull/2553): `useDictateInterims`, `useDictateState`, `useGrammars`, `useMarkActivityAsSpoken`, `useMicrophoneButton`, `useShouldSpeakIncomingActivity`, `useStartDictate`, `useStopDictate`, `useVoiceSelector`, `useWebSpeechPonyfill`
   -  PR [#2554](https://github.com/microsoft/BotFramework-WebChat/pull/2554): `useRenderActivity`, `useRenderAttachment`
   -  PR [#2644](https://github.com/microsoft/BotFramework-WebChat/pull/2644): Added `internal/useWebChatUIContext` for cleaner code
   -  PR [#2652](https://github.com/microsoft/BotFramework-WebChat/pull/2652): Update samples to use hooks
-  Bring your own Adaptive Cards package by specifying `adaptiveCardsPackage` prop, by [@compulim](https://github.com/compulim) in PR [#2543](https://github.com/microsoft/BotFramework-WebChat/pull/2543)
-  Fixes [#2597](https://github.com/microsoft/BotFramework-WebChat/issues/2597). Modify `watch` script to `start` and add `tableflip` script for throwing `node_modules`, by [@corinagum](https://github.com/corinagum) in PR [#2598](https://github.com/microsoft/BotFramework-WebChat/pull/2598)
-  Adds Arabic Language Support, by [@midineo](https://github.com/midineo), in PR [#2593](https://github.com/microsoft/BotFramework-WebChat/pull/2593)
-  Adds `AdaptiveCardsComposer` and `AdaptiveCardsContext` for composability for Adaptive Cards, by [@compulim](https://github.com/compulim), in PR [#2648](https://github.com/microsoft/BotFramework-WebChat/pull/2648)
-  Adds Direct Line Speech support, by [@compulim](https://github.com/compulim) in PR [#2621](https://github.com/microsoft/BotFramework-WebChat/pull/2621)
   -  Adds [`microsoft-cognitiveservices-sdk@1.8.1`](https://npmjs.com/package/microsoft-cognitiveservices-speech-sdk), in PR [#2704](https://github.com/microsoft/BotFramework-WebChat/pull/2704)
-  Fixes [#2692](https://github.com/microsoft/BotFramework-WebChat/issues/2692). Rename sample 17 to 17.a, by [@corinagum](https://github.com/corinagum) in PR [#2695](https://github.com/microsoft/BotFramework-WebChat/pull/2695)

### Fixed

-  Fixes [#2565](https://github.com/microsoft/BotFramework-WebChat/issues/2565). Fixed Adaptive Card host config should generate from style options with default options merged, by [@compulim](https://github.com/compulim) in PR [#2566](https://github.com/microsoft/BotFramework-WebChat/pull/2566)
-  Resolves [#2337](https://github.com/microsoft/BotFramework-WebChat/issues/2337). Remove Cognitive Services Preview warning, by [@corinagum](https://github.com/corinagum) in PR [#2578](https://github.com/microsoft/BotFramework-WebChat/pull/2578)
-  Fixes [#2559](https://github.com/microsoft/BotFramework-WebChat/issues/2559). De-bump remark and strip-markdown, by [@corinagum](https://github.com/corinagum) in PR [#2576](https://github.com/microsoft/BotFramework-WebChat/pull/2576)
-  Fixes [#2512](https://github.com/microsoft/BotFramework-WebChat/issues/2512). Adds check to ensure Adaptive Card's content is an Object, by [@tdurnford](https://github.com/tdurnford) in PR [#2590](https://github.com/microsoft/BotFramework-WebChat/pull/2590)
-  Fixes [#1780](https://github.com/microsoft/BotFramework-WebChat/issues/1780), [#2277](https://github.com/microsoft/BotFramework-WebChat/issues/2277), and [#2285](https://github.com/microsoft/BotFramework-WebChat/issues/2285). Make Suggested Actions accessible, Fix Markdown card in carousel being read multiple times, and label widgets of Connectivity Status and Suggested Actions containers, by [@corinagum](https://github.com/corinagum) in PR [#2613](https://github.com/microsoft/BotFramework-WebChat/pull/2613)
-  Fixes [#2608](https://github.com/microsoft/BotFramework-WebChat/issues/2608). Focus will return to sendbox after clicking New Messages or a Suggested Actions button, by [@corinagum](https://github.com/corinagum) in PR [#2628](https://github.com/microsoft/BotFramework-WebChat/pull/2628)
-  Resolves [#2597](https://github.com/microsoft/BotFramework-WebChat/issues/2597). Modify `watch` script to `start` and add `tableflip` script for throwing `node_modules`, by [@corinagum](https://github.com/corinagum) in PR [#2598](https://github.com/microsoft/BotFramework-WebChat/pull/2598)
-  Resolves [#1835](https://github.com/microsoft/BotFramework-WebChat/issues/1835). Adds `suggestedActionLayout` to `defaultStyleOptions`, by [@spyip](https://github.com/spyip), in PR [#2596](https://github.com/microsoft/BotFramework-WebChat/pull/2596)
-  Resolves [#2331](https://github.com/microsoft/BotFramework-WebChat/issues/2331). Updated timer to use React Hooks, by [@spyip](https://github.com/spyip) in PR [#2546](https://github.com/microsoft/BotFramework-WebChat/pull/2546)
-  Resolves [#2620](https://github.com/microsoft/BotFramework-WebChat/issues/2620). Adds Chinese localization files, by [@spyip](https://github.com/spyip) in PR [#2631](https://github.com/microsoft/BotFramework-WebChat/pull/2631)
-  Fixes [#2639](https://github.com/microsoft/BotFramework-WebChat/issues/2639). Fix passed in prop time from string to boolean, by [@corinagum](https://github.com/corinagum) in PR [#2640](https://github.com/microsoft/BotFramework-WebChat/pull/2640)
-  `component`: Updated timer to use functional component, by [@spyip](https://github.com/spyip) in PR [#2546](https://github.com/microsoft/BotFramework-WebChat/pull/2546)
-  Fixes [#2651](https://github.com/microsoft/BotFramework-WebChat/issues/2651). Add `ends-with` string module to ES5 bundle, by [@corinagum](https://github.com/corinagum) in PR [#2654](https://github.com/microsoft/BotFramework-WebChat/pull/2654)
-  Fixes [#2658](https://github.com/microsoft/BotFramework-WebChat/issues/2658). Fix rendering of markdown images in IE11, by [@corinagum](https://github.com/corinagum) in PR [#2659](https://github.com/microsoft/BotFramework-WebChat/pull/2659)
-  Fixes [#2662](https://github.com/microsoft/BotFramework-WebChat/issues/2662) and [#2666](https://github.com/microsoft/BotFramework-WebChat/issues/2666). Fix various issues related to Direct Line Speech, by [@compulim](https://github.com/compulim) in PR [#2671](https://github.com/microsoft/BotFramework-WebChat/pull/2671)
   -  Added triple-buffering to reduce pops/cracks.
   -  Enable Safari by upsampling to 48000 Hz.
   -  Support detailed output format on Web Chat side.
-  Fixes [#2700](https://github.com/microsoft/BotFramework-WebChat/issues/2700). Enable `<SayComposer>` and Adaptive Cards in recompose story, in PR [#2649](https://github.com/microsoft/BotFramework-WebChat/pull/2649)
   -  Moved `<SayComposer>` from `<BasicTranscript>` to `<Composer>`
   -  Moved WebSpeechPonyfill patching code from `<BasicTranscript>` to `<Composer>`
-  Fixes [#2699](https://github.com/microsoft/BotFramework-WebChat/issues/2699). Disable speech recognition and synthesis when using Direct Line Speech under IE11, by [@compulim](https://github.com/compulim), in PR [#2649](https://github.com/microsoft/BotFramework-WebChat/pull/2649)
-  Fixes [#2709](https://github.com/microsoft/BotFramework-WebChat/issues/2709). Reduce wasted render of activities by memoizing partial result of `<BasicTranscript>`, by [@compulim](https://github.com/compulim) in PR [#2710](https://github.com/microsoft/BotFramework-WebChat/pull/2710)
-  Fixes [#2710](https://github.com/microsoft/BotFramework-WebChat/issues/2710). Suggested actions container should persist for AT, by [@corinagum](https://github.com/corinagum) in PR [#2710](https://github.com/microsoft/BotFramework-WebChat/pull/2710)
-  Fixes [#2718](https://github.com/microsoft/BotFramework-WebChat/issues/2718). Add `Object.is` polyfill for IE11, by [@compulim](https://github.com/compulim) in PR [#2719](https://github.com/microsoft/BotFramework-WebChat/pull/2719)
-  Fixes [#2723](https://github.com/microsoft/BotFramework-WebChat/issues/2723). Fix `renderMarkdown` should not be called if it is `undefined` in minimal bundle, by [@compulim](https://github.com/compulim) in PR [#2724](https://github.com/microsoft/BotFramework-WebChat/pull/2724)
-  Fixes [#2655](https://github.com/microsoft/BotFramework-WebChat/issues/2655). "Taking longer than usual to connect" should not show up after reconnect succeeded, by [@curiousite](https://github.com/Curiousite) and [@compulim](https://github.com/compulim) in PR [#2656](https://github.com/microsoft/BotFramework-WebChat/pull/2656)
-  Fixes [#2942](https://github.com/microsoft/BotFramework-WebChat/issues/2942). Fix typing indicator should not show up for the user, by [@compulim](https://github.com/compulim) in PR [#2950](https://github.com/microsoft/BotFramework-WebChat/pull/2950)

### Changed

-  Bumped all dependencies to latest version, by [@compulim](https://github.com/compulim), in PR [#2533](https://github.com/microsoft/BotFramework-WebChat/pull/2533) and PR [#2621](https://github.com/microsoft/BotFramework-WebChat/pull/2621)
   -  Development dependencies
      -  Root package
         -  `@azure/storage-blob@12.0.0`
         -  `@babel/plugin-proposal-class-properties@7.5.5`
         -  `@babel/plugin-proposal-object-rest-spread@7.6.2`
         -  `@babel/plugin-transform-runtime@7.6.2`
         -  `@babel/preset-env@7.6.3`
         -  `@babel/preset-react@7.6.3`
         -  `@babel/preset-typescript@7.6.0`
         -  `@babel/runtime@7.6.3`
         -  `babel-jest@24.9.0`
         -  `core-js@3.3.6`
         -  `coveralls@3.0.7`
         -  `husky@3.0.9`
         -  `jest-image-snapshot@2.11.0`
         -  `jest@24.9.0`
         -  `lerna@3.18.3`
         -  `lint-staged@9.4.2`
         -  `selenium-webdriver@4.0.0-alpha.5`
         -  `serve-handler@6.1.2`
      -  Other packages
         -  `@babel/cli@7.6.4`
         -  `@babel/core@7.6.4`
         -  `@babel/plugin-proposal-class-properties@7.5.5`
         -  `@babel/plugin-proposal-object-rest-spread@7.6.2`
         -  `@babel/plugin-transform-runtime@7.6.2`
         -  `@babel/preset-env@7.6.3`
         -  `@babel/preset-react@7.6.3`
         -  `@babel/preset-typescript@7.6.0`
         -  `@types/node@12.12.3`
         -  `@types/react@16.9.11`
         -  `@typescript-eslint/eslint-plugin@2.6.0`
         -  `@typescript-eslint/parser@2.6.0`
         -  `babel-plugin-istanbul@5.2.0`
         -  `concurrently@5.0.0`
         -  `copy-webpack-plugin@5.0.4`
         -  `eslint-plugin-prettier@3.1.1`
         -  `eslint-plugin-react-hooks@2.2.0`
         -  `eslint-plugin-react@7.16.0`
         -  `eslint@6.6.0`
         -  `http-proxy-middleware@0.20.0`
         -  `jest@24.9.0`
         -  `terser-webpack-plugin@2.2.1`
         -  `typescript@3.6.4`
         -  `webpack-cli@3.3.10`
         -  `webpack@4.41.2`
   -  Production dependencies
      -  `core`
         -  `@babel/runtime@7.6.3`
         -  `jsonwebtoken@8.5.1`
         -  `math-random`
         -  `redux-saga@1.1.1`
         -  `simple-update-in@2.1.1`
      -  `bundle`
         -  `@babel/runtime@7.6.3`
         -  `core-js@3.3.6`
         -  `markdown-it@10.0.0`
         -  `memoize-one@5.1.1`
         -  `sanitize-html@1.19.0`
         -  `url-search-params-polyfill@7.0.0`
      -  `component`
         -  `bytes@3.1.0`
         -  `memoize-one@5.1.1`
         -  `react-dictate-button@1.2.1`
         -  `react-redux@7.1.1`
         -  `remark@11.0.1`
         -  `sanitize-html@1.20.1`
         -  `simple-update-in@2.1.1`
         -  `strip-markdown@3.1.1`
      -  `embed`
         -  `@babel/runtime@7.6.3`
         -  `core-js@3.3.6`
-  `component`: Bumps [`adaptivecards@1.2.3`](https://npmjs.com/package/adaptivecards), by [@corinagum](https://github.com/corinagum) in PR [#2523](https://github.com/microsoft/BotFramework-WebChat/pull/2532)
-  Bumps Chrome in Docker to 78.0.3904.70, by [@spyip](https://github.com/spyip) in PR [#2545](https://github.com/microsoft/BotFramework-WebChat/pull/2545)
-  `bundle`: Webpack will now use `webpack-stats-plugin` instead of `webpack-visualizer-plugin`, by [@compulim](https://github.com/compulim) in PR [#2584](https://github.com/microsoft/BotFramework-WebChat/pull/2584)
   -  This will fix [#2583](https://github.com/microsoft/BotFramework-WebChat/issues/2583) by not bringing in transient dependency of React
   -  To view the bundle stats, browse to https://chrisbateman.github.io/webpack-visualizer/ and drop the file `/packages/bundle/dist/stats.json`
-  Resolves [#2674](https://github.com/microsoft/BotFramework-WebChat/issues/2674). Update embed docs, by [@corinagum](https://github.com/corinagum), in PR [#2696](https://github.com/microsoft/BotFramework-WebChat/pull/2696)

### Samples

-  [Clear Conversation After Idle](https://microsoft.github.io/BotFramework-WebChat/04.api/h.clear-after-idle/), by [@tdurnford](https://github.com/tdurnford), in PR [#2375](https://github.com/microsoft/BotFramework-WebChat/pull/2375)
-  [Smart Display](https://microsoft.github.io/BotFramework-WebChat/24.customization-smart-display/), by [@compulim](https://github.com/compulim), in PR [#2649](https://github.com/microsoft/BotFramework-WebChat/pull/2649)

## [4.6.0] - 2019-10-31

### Breaking changes

-  We will no longer include `react` and `react-dom` in our NPM package, instead, we will requires peer dependencies of `react@^16.8.6` and `react-dom@^16.8.6`

### Changed

-  `*`: Bumps all dev dependencies to latest version, by [@compulim](https://github.com/compulim), in PR [#2182](https://github.com/microsoft/BotFramework-WebChat/pull/2182) and PR [#2308](https://github.com/microsoft/BotFramework-WebChat/pull/2308)
   -  [`@babel/*@7.5.4`](https://www.npmjs.com/package/@babel/core)
   -  [`jest@24.8.0`](https://www.npmjs.com/package/jest)
   -  [`lerna@3.15.0`](https://www.npmjs.com/package/lerna)
   -  [`react-redux@7.1.0`](https://www.npmjs.com/package/react-redux)
   -  [`typescript@3.5.3`](https://www.npmjs.com/package/typescript)
   -  [`webpack@4.35.3`](https://www.npmjs.com/package/webpack)
-  `*`: Bumps [`@babel/runtime@7.5.4`](https://www.npmjs.com/package/@babel/runtime), by [@compulim](https://github.com/compulim), in PR [#2182](https://github.com/microsoft/BotFramework-WebChat/pull/2182)
-  `*`: Bumps Docker container for headless Chrome to `selenium/standalone-chrome:3.141.59-radium`, by [@compulim](https://github.com/compulim), in PR [#2182](https://github.com/microsoft/BotFramework-WebChat/pull/2182)
-  `*`: Moves from [`babel-plugin-version-transform`](https://www.npmjs.com/package/babel-plugin-version-transform) to [`babel-plugin-transform-inline-environment-variables`](https://www.npmjs.com/package/babel-plugin-transform-inline-environment-variables), by [@compulim](https://github.com/compulim), in PR [#2182](https://github.com/microsoft/BotFramework-WebChat/pull/2182)
-  `*`: Bumps ESLint and related dependencies to latest version, by [@compulim](https://github.com/compulim), in PR [#2185](https://github.com/microsoft/BotFramework-WebChat/pull/2185)
   -  [`eslint-plugin-react@7.14.2`](https://www.npmjs.com/package/eslint-plugin-react)
   -  [`eslint@6.0.1`](https://www.npmjs.com/package/eslint)
-  `*`: Bumps React, Redux and their related dependencies to latest version, by [@compulim](https://github.com/compulim), in PR [#2184](https://github.com/microsoft/BotFramework-WebChat/pull/2184)
   -  [`react-dom@16.8.6`](https://www.npmjs.com/package/react-dom)
   -  [`react-redux@5.1.1`](https://www.npmjs.com/package/react-redux)
   -  [`react@16.8.6`](https://www.npmjs.com/package/react)
   -  [`redux@4.0.4`](https://www.npmjs.com/package/redux)
   -  Removed [`redux-promise-middleware`](https://www.npmjs.com/package/redux-promise-middleware)
-  `*`: Bumps `lodash-*`(https://www.npmjs.com/package/lodash), by [@compulim](https://github.com/compulim), in PR [#2199](https://github.com/microsoft/BotFramework-WebChat/pull/2199)
   -  [`lodash@4.17.14`](https://www.npmjs.com/package/lodash)
   -  [`lodash.mergewith@4.6.2`](https://www.npmjs.com/package/lodash.mergewith)
   -  [`lodash.template@4.5.0`](https://www.npmjs.com/package/lodash.template)
   -  [`lodash.templatesettings@4.2.0`](https://www.npmjs.com/package/lodash.template)
   -  [`mixin-deep@1.3.2`](https://www.npmjs.com/package/mixin-deep)
   -  [`set-value@2.0.1`](https://www.npmjs.com/package/set-value)
   -  [`union-value@1.0.1`](https://www.npmjs.com/package/union-value)
-  Bumps [`web-speech-cognitive-services@4.0.1-master.6b2b9e3`](https://www.npmjs.com/package/web-speech-cognitive-services), by [@compulim](https://github.com/compulim) in PR [#2246](https://github.com/microsoft/BotFramework-WebChat/pull/2246), PR [#2274](https://github.com/microsoft/BotFramework-WebChat/pull/2274), and PR [#2338](https://github.com/microsoft/BotFramework-WebChat/pull/2338)
-  Fix for React hooks constraints: both app and component must share the same reference of [`react`](https://www.npmjs.com/package/react) and [`react-dom`](https://www.npmjs.com/package/react-dom), in PR [#2274](https://github.com/microsoft/BotFramework-WebChat/pull/2274)
   -  `/`: Install [`react`](https://www.npmjs.com/package/react) and [`react-dom`](https://www.npmjs.com/package/react-dom) to `devDependencies`
   -  `bundle`: Move [`react`](https://www.npmjs.com/package/react) and [`react-dom`](https://www.npmjs.com/package/react-dom) from `dependencies` to `peerDependencies`
   -  `component`: Remove [`react`](https://www.npmjs.com/package/react) and [`react-dom`](https://www.npmjs.com/package/react-dom) from `devDependencies`
   -  `playground`: Remove [`react`](https://www.npmjs.com/package/react) and [`react-dom`](https://www.npmjs.com/package/react-dom) from `dependencies`
   -  `samples/*`: Move to production version of Web Chat, and bump to [`react@16.8.6`](https://www.npmjs.com/package/react) and [`react-dom@16.8.6`](https://www.npmjs.com/package/react-dom)
-  Moved the typing indicator to the send box and removed the typing indicator logic from the sagas, by [@tdurnford](https://github.com/tdurnford), in PR [#2321](https://github.com/microsoft/BotFramework-WebChat/pull/2321)
-  `component`: Move `Composer` to React hooks and functional components, by [@compulim](https://github.com), in PR [#2308](https://github.com/microsoft/BotFramework-WebChat/pull/2308)
-  `component`: Fix [#1818](https://github.com/microsoft/BotFramework-WebChat/issues/1818) Move to functional components by [@corinagum](https://github.com/corinagum), in PR [#2322](https://github.com/microsoft/BotFramework-WebChat/pull/2322)
-  Fix [#2292](https://github.com/microsoft/BotFramework-WebChat/issues/2292). Added function to select voice to props, `selectVoice()`, by [@compulim](https://github.com/compulim), in PR [#2338](https://github.com/microsoft/BotFramework-WebChat/pull/2338)
-  Bumping dependencies, by [@compulim](https://github.com/compulim), in PR [#2500](https://github.com/microsoft/BotFramework-WebChat/pull/2500)
   -  `*`: [`web-speech-cognitive-services@5.0.1`](https://www.npmjs.com/package/web-speech-cognitive-services)
   -  `bundle`: [`botframework-directlinejs@0.11.6`](https://www.npmjs.com/package/botframework-directlinejs)
   -  `component`: [`react-film@1.3.0`](https://www.npmjs.com/package/react-film)

### Fixed

-  Fixes [#2328](https://github.com/microsoft/BotFramework-WebChat/issues/2328). Updating submitSendBoxSaga.js to send sendBoxValue.trim(), by [@jimmyjames177414](https://github.com/jimmyjames177414) in PR [#2331](https://github.com/microsoft/BotFramework-WebChat/pull/2331)
-  Fixes [#2160](https://github.com/microsoft/BotFramework-WebChat/issues/2160). Clear suggested actions after clicking on a suggested actions of type `openUrl`, by [@tdurnford](https://github.com/tdurnford) in PR [#2190](https://github.com/microsoft/BotFramework-WebChat/pull/2190)
-  Fixes [#1954](https://github.com/microsoft/BotFramework-WebChat/issues/1954). Estimate clock skew and adjust timestamp for outgoing activity, by [@compulim](https://github.com/compulim) in PR [#2208](https://github.com/microsoft/BotFramework-WebChat/pull/2208)
-  Fixes [#2240](https://github.com/microsoft/BotFramework-WebChat/issues/2240). Fix microphone button should be re-enabled after error, by [@compulim](https://github.com/compulim) in PR [#2241](https://github.com/microsoft/BotFramework-WebChat/pull/2241)
-  Fixes [#2250](https://github.com/microsoft/BotFramework-WebChat/issues/2250). Fix React warnings related prop types, by [@compulim](https://github.com/compulim) in PR [#2253](https://github.com/microsoft/BotFramework-WebChat/pull/2253)
-  Fixes [#2245](https://github.com/microsoft/BotFramework-WebChat/issues/2245). Fix speech synthesis not working on Safari by priming the engine on the first microphone button click, by [@compulim](https://github.com/compulim) in PR [#2246](https://github.com/microsoft/BotFramework-WebChat/pull/2246)
-  Fixes [#1514](https://github.com/microsoft/BotFramework-WebChat/issues/1514). Added reference grammar ID when using Cognitive Services Speech Services, by [@compulim](https://github.com/compulim) in PR [#2246](https://github.com/microsoft/BotFramework-WebChat/pull/2246)
-  Fixes [#1515](https://github.com/microsoft/BotFramework-WebChat/issues/1515). Added dynamic phrases when using Cognitive Services Speech Services, by [@compulim](https://github.com/compulim) in PR [#2246](https://github.com/microsoft/BotFramework-WebChat/pull/2246)
-  Fixes [#2273](https://github.com/microsoft/BotFramework-WebChat/issues/2273). Add `ScreenReaderText` component, by [@corinagum](https://github.com/corinagum) in PR [#2278](https://github.com/microsoft/BotFramework-WebChat/pull/2278)
-  Fixes [#2231](https://github.com/microsoft/BotFramework-WebChat/issues/2231). Fallback to English (US) if date time formatting failed, by [@compulim](https://github.com/compulim) in PR [#2286](https://github.com/microsoft/BotFramework-WebChat/pull/2286)
-  Fixes [#2298](https://github.com/microsoft/BotFramework-WebChat/issues/2298). Speech synthesize errors to be ignored, by [@compulim](https://github.com/compulim) in PR [#2300](https://github.com/microsoft/BotFramework-WebChat/issues/2300)
-  Fixes [#2243](https://github.com/microsoft/BotFramework-WebChat/issues/2243). Fixed sagas to correctly mark activities with speaking attachments, by [@tdurnford](https://github.com/tdurnford) in PR [#2320](https://github.com/microsoft/BotFramework-WebChat/issues/2320)
-  Fixes [#2365](https://github.com/microsoft/BotFramework-WebChat/issues/2365). Fix Adaptive Card `pushButton` appearance on Chrome, by [@corinagum](https://github.com/corinagum) in PR [#2382](https://github.com/microsoft/BotFramework-WebChat/pull/2382)
-  Fixes [#2379](https://github.com/microsoft/BotFramework-WebChat/issues/2379). Speech synthesis can be configured off by passing `null`, by [@compulim](https://github.com/compulim) in PR [#2408](https://github.com/microsoft/BotFramework-WebChat/pull/2408)
-  Fixes [#2418](https://github.com/microsoft/BotFramework-WebChat/issues/2418). Connectivity status should not waste-render every 400 ms, by [@compulim](https://github.com/compulim) in PR [#2419](https://github.com/microsoft/BotFramework-WebChat/pull/2419)
-  Fixes [#2415](https://github.com/microsoft/BotFramework-WebChat/issues/2415) and [#2416](https://github.com/microsoft/BotFramework-WebChat/issues/2416). Fix receipt card rendering, by [@compulim](https://github.com/compulim) in PR [#2417](https://github.com/microsoft/BotFramework-WebChat/issues/2417)
-  Fixes [#2415](https://github.com/microsoft/BotFramework-WebChat/issues/2415) and [#2416](https://github.com/microsoft/BotFramework-WebChat/issues/2416). Fix Adaptive Cards cannot be disabled on-the-fly, by [@compulim](https://github.com/compulim) in PR [#2417](https://github.com/microsoft/BotFramework-WebChat/issues/2417)
-  Fixes [#2360](https://github.com/microsoft/BotFramework-WebChat/issues/2360). Timestamp should update on language change, by [@compulim](https://github.com/compulim) in PR [#2414](https://github.com/microsoft/BotFramework-WebChat/pull/2414)
-  Fixes [#2428](https://github.com/microsoft/BotFramework-WebChat/issues/2428). Should interrupt speech synthesis after microphone button is clicked, by [@compulim](https://github.com/compulim) in PR [#2429](https://github.com/microsoft/BotFramework-WebChat/pull/2429)
-  Fixes [#2435](https://github.com/microsoft/BotFramework-WebChat/issues/2435). Fix microphone button getting stuck on voice-triggered expecting input hint without a speech synthesis engine, by [@compulim](https://github.com/compulim) in PR [#2445](https://github.com/microsoft/BotFramework-WebChat/pull/2445)
-  Fixes [#2472](https://github.com/microsoft/BotFramework-WebChat/issues/2472). Update samples to use repo's version of React, by [@corinagum](https://github.com/corinagum) in PR [#2478](https://github.com/microsoft/BotFramework-WebChat/pull/2478)
-  Fixes [#2473](https://github.com/microsoft/BotFramework-WebChat/issues/2473). Fix samples 13 using wrong region for Speech Services credentials, by [@compulim](https://github.com/compulim) in PR [#2482](https://github.com/microsoft/BotFramework-WebChat/pull/2482)
-  Fixes [#2420](https://github.com/microsoft/BotFramework-WebChat/issues/2420). Fix saga error should not result in an unhandled exception, by [@compulim](https://github.com/compulim) in PR [#2421](https://github.com/microsoft/BotFramework-WebChat/pull/2421)
-  Fixes [#2513](https://github.com/microsoft/BotFramework-WebChat/issues/2513). Fix `core-js` not loading properly, by [@compulim](https://github.com/compulim) in PR [#2514](https://github.com/microsoft/BotFramework-WebChat/pull/2514)
-  Fixes [#2516](https://github.com/microsoft/BotFramework-WebChat/issues/2516). Disable microphone input for `expecting` input hint on Safari, by [@compulim](https://github.com/compulim) in PR [#2517](https://github.com/microsoft/BotFramework-WebChat/pull/2517) and PR [#2520](https://github.com/microsoft/BotFramework-WebChat/pull/2520)
-  Fixes [#2518](https://github.com/microsoft/BotFramework-WebChat/issues/2518). Synthesis of bot activities with input hint expecting, should be interruptible, by [@compulim](https://github.com/compulim) in PR [#2520](https://github.com/microsoft/BotFramework-WebChat/pull/2520)
-  Fixes [#2519](https://github.com/microsoft/BotFramework-WebChat/issues/2519). On Safari, microphone should turn on after synthesis of bot activities with input hint expecting, by [@compulim](https://github.com/compulim) in PR [#2520](https://github.com/microsoft/BotFramework-WebChat/pull/2520)
-  Fixes [#2521](https://github.com/microsoft/BotFramework-WebChat/issues/2521). `webchat-es5.js` should not contains non-ES5 code and must be loadable by IE11, by [@compulim](https://github.com/compulim) in PR [#2522](https://github.com/microsoft/BotFramework-WebChat/pull/2522)
-  Fixes [#2524](https://github.com/microsoft/BotFramework-WebChat/issues/2524). Version was not burnt into source code correctly, by [@compulim](https://github.com/compulim) in PR [#2525](https://github.com/microsoft/BotFramework-WebChat/pull/2525)

### Added

-  Resolves [#2157](https://github.com/microsoft/BotFramework-WebChat/issues/2157), added `emitTypingIndicator` action and dispatcher, by [@compulim](https://github.com/compulim), in PR [#2413](https://github.com/microsoft/BotFramework-WebChat/pull/2413)
-  Resolves [#2307](https://github.com/microsoft/BotFramework-WebChat/issues/2307). Added options to hide ScrollToEnd button, by [@nt-7](https://github.com/nt-7) in PR [#2332](https://github.com/microsoft/BotFramework-WebChat/pull/2332)
-  Added bubble nub and style options, by [@compulim](https://github.com/compulim), in PR [#2137](https://github.com/microsoft/BotFramework-WebChat/pull/2137) and PR [#2487](https://github.com/microsoft/BotFramework-WebChat/pull/2487)
-  Resolves [#1808](https://github.com/microsoft/BotFramework-WebChat/issues/1808). Added documentation on [activity types](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/ACTIVITYTYPES.md), by [@corinagum](https://github.com/corinagum) in PR [#2228](https://github.com/microsoft/BotFramework-WebChat/pull/2228)
-  Added `timestampFormat` option to the default style options and created `AbsoluteTime` component, by [@tdurnford](https://github.com/tdurnford), in PR [#2295](https://github.com/microsoft/BotFramework-WebChat/pull/2295)
-  `embed`: Added ES5 polyfills and dev server, by [@compulim](https://github.com/compulim), in PR [#2315](https://github.com/microsoft/BotFramework-WebChat/pull/2315)
-  Resolves [#2380](https://github.com/microsoft/BotFramework-WebChat/issues/2380). Added `botAvatarBackgroundColor` and `userAvatarBackgroundColor` to the default style options, by [@tdurnford](https://github.com/tdurnford) in PR [#2384](https://github.com/microsoft/BotFramework-WebChat/pull/2384)
-  Added full screen capability to `IFRAME` in the `YouTubeContent` and `VimeoContent` components by [@tdurnford](https://github.com/tdurnford) in PR [#2399](https://github.com/microsoft/BotFramework-WebChat/pull/2399)
-  Resolves [#2461](https://github.com/microsoft/BotFramework-WebChat/issues/2461), added `isomorphic-react` and `isomorphic-react-dom` packages, by [@compulim](https://github.com/compulim) and [@corinagum](https://github.com/corinagum), in PR [#2478](https://github.com/microsoft/BotFramework-WebChat/pull/2478) and PR [#2486](https://github.com/microsoft/BotFramework-WebChat/pull/2486)
-  Added missing Norwegian (nb-NO) translations, by [@taarskog](https://github.com/taarskog)
-  Added missing Italian (it-IT) translations, by [@AntoT84](https://github.com/AntoT84)
-  Resolve [#2481](https://github.com/microsoft/BotFramework-WebChat/issues/2481). Support alternative audio input source by adding `audioConfig` prop to `createCognitiveServicesSpeechServicesPonyfillFactory`, by [@corinagum](https://github.com/corinagum), in PR [#2491](https://github.com/microsoft/BotFramework-WebChat/pull/2491)
-  Added missing Finnish (fi-FI) translations, by [@sk91swd](https://github.com/sk91swd), in PR [#2501](https://github.com/microsoft/BotFramework-WebChat/pull/2501)

### Samples

-  [Single sign-on for Microsoft Teams apps](https://microsoft.github.io/BotFramework-WebChat/07.advanced-web-chat-apps/d.sso-for-teams/), by [@compulim](https://github.com/compulim) in [#2196](https://github.com/microsoft/BotFramework-WebChat/pull/2196)
-  [Customize Web Chat with Reaction Buttons](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/d.reaction-buttons/). Updated reaction handlers to send `messageReaction` activities, by [@tdurnford](https://github.com/tdurnford) in [#2239](https://github.com/microsoft/BotFramework-WebChat/pull/2239)
-  [Select voice for speech synthesis](https://microsoft.github.io/BotFramework-WebChat/03.speech/e.select-voice/), by [@compulim](https://github.com/compulim), in PR [#2338](https://github.com/microsoft/BotFramework-WebChat/pull/2338)
-  [Using different versions of React on a hosting app via NPM packages](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/g.hybrid-react-npm/), by [@compulim](https://github.com/compulim), in PR [#2509](https://github.com/microsoft/BotFramework-WebChat/pull/2509)

## [4.5.3] - 2019-10-10

### Changed

-  `bundle`: Bumped DirectLineJS to support metadata when uploading attachments, in PR [#2433](https://github.com/microsoft/BotFramework-WebChat/pull/2433)
   -  [`botframework-directlinejs@0.11.5`](https://www.npmjs.com/package/botframework-directlinejs)
   -  Removed DirectLineJS as a dev dependency for `component` because it was not referenced

### Fixed

-  Fixes [#2248](https://github.com/microsoft/BotFramework-WebChat/issues/2248). Remove download links from user-uploaded attachment without thumbnails, by [@compulim](https://github.com/compulim) in PR [#2262](https://github.com/microsoft/BotFramework-WebChat/pull/2262)
-  Fixes [Emulator:#1823](https://github.com/microsoft/BotFramework-Emulator/issues/1823). Fix Sendbox "Type your message" being read twice by AT, by [@corinagum](https://github.com/corinagum) in PR [#2423](https://github.com/microsoft/BotFramework-WebChat/pull/2423)
-  Fixes [#2422](https://github.com/microsoft/BotFramework-WebChat/issues/2422). Store thumbnail URL using the activity's `attachment.thumbnailUrl` field, by [@compulim](https://github.com/compulim) in PR [#2433](https://github.com/microsoft/BotFramework-WebChat/pull/2433)

### Added

-  Make thumbnails when uploading GIF/JPEG/PNG and store it in `channelData.attachmentThumbnails`, by [@compulim](https://github.com/compulim), in PR [#2206](https://github.com/microsoft/BotFramework-WebChat/pull/2206), requires modern browsers with following features:
   -  [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
   -  [`createImageBitmap`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/createImageBitmap)
   -  [`MessageChannel`](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel)/[`MessagePort`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort)
   -  [`OffscreenCanvas`](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
      -  Specifically [`OffscreenCanvas.getContext('2d')`](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/getContext)
-  Render thumbnail for image attachments using `activity.attachments[].thumbnailUrl`, by [@compulim](https://github.com/compulim) in PR [#2433](https://github.com/microsoft/BotFramework-WebChat/pull/2433)

## [4.5.2] - 2019-08-07

-  Fixes [#2273](https://github.com/microsoft/BotFramework-WebChat/issues/2273). Add `ScreenReaderText` component, by [@corinagum](https://github.com/corinagum) in PR [#2278](https://github.com/microsoft/BotFramework-WebChat/pull/2278)

## [4.5.1] - 2019-08-01

### Fixed

-  Fixes [#2187](https://github.com/microsoft/BotFramework-WebChat/issues/2187). Bump core-js and update core-js modules on index-es5.js, by [@corinagum](https://github.com/corinagum) in PR [#2195](https://github.com/microsoft/BotFramework-WebChat/pull/2195)
-  Fixes [#2193](https://github.com/microsoft/BotFramework-WebChat/issues/2193). Fix Adaptive Card/attachments do not get read by Narrator, by [@corinagum](https://github.com/corinagum) in PR [#2226](https://github.com/microsoft/BotFramework-WebChat/pull/2226)
-  Fixes [#2150](https://github.com/microsoft/BotFramework-WebChat/issues/2193). Fix timestamps read by Narrator, by [@corinagum](https://github.com/corinagum) in PR [#2226](https://github.com/microsoft/BotFramework-WebChat/pull/2226)
-  Fixes [#2250](https://github.com/microsoft/BotFramework-WebChat/issues/2250). Fix React warnings related prop types, by [@compulim](https://github.com/compulim) in PR [#2253](https://github.com/microsoft/BotFramework-WebChat/pull/2253)

## [4.5.0] - 2019-07-10

### Added

-  `*`: Added [`eslint`](https://npmjs.com/package/eslint/) to static code analysis, by [@compulim](https://github.com/compulim), in PR [#1970](https://github.com/microsoft/BotFramework-WebChat/pull/1970)
-  Added pt-PT language, by [@bodyzatva](https://github.com/bodyzatva) in PR [#2005](https://github.com/microsoft/BotFramework-WebChat/pull/2005) and PR [#2020](https://github.com/microsoft/BotFramework-WebChat/pull/2020)
-  Added documentation for using Web Chat dev build, by [@corinagum](https://github.com/corinagum), in PR [#2074](https://github.com/microsoft/BotFramework-WebChat/pull/2074)
-  Added the Web Chat version to DirectLine's botAgent option, by [@tdurnford](https://github.com/tdurnford), in PR [#2101](https://github.com/microsoft/BotFramework-WebChat/pull/2101)
-  Added `richCardWrapTitle` to `defaultStyleOptions`, by [@tdurnford](https://github.com/tdurnford), in PR [#2115](https://github.com/microsoft/BotFramework-WebChat/pull/2115)
-  Added test harness for speech recognition and synthesis for [#2122](https://github.com/microsoft/BotFramework-WebChat/issues/2122), by [@compulim](https://github.com/compulim), in PR [#2153](https://github.com/microsoft/BotFramework-WebChat/pull/2153)

### Changed

-  `*`: Bumps to [`lerna@3.13.4`](https://npmjs.com/package/lerna/), by [@corinagum](https://github.com/corinagum), in PR [#1989](https://github.com/microsoft/BotFramework-WebChat/pull/1989)
-  `*`: Bumps to:
   -  [`lerna@3.13.4`](https://npmjs.com/package/lerna/),
   -  [`react-scripts@3.0.0`](https://npmjs.com/package/react-scripts/),
   -  [`webpack@4.30.0`](https://npmjs.com/package/webpack/), by [@corinagum](https://github.com/corinagum), in PR [#1965](https://github.com/microsoft/BotFramework-WebChat/pull/1965)
-  `bundle`: Bumps to [`adaptivecards@1.2.0`](https://npmjs.com/package/adaptivecards), by [@corinagum](https://github.com/corinagum), in PR [#2064](https://github.com/microsoft/BotFramework-WebChat/pull/2064)

### Fixed

-  Fixes [#1974](https://github.com/microsoft/BotFramework-WebChat/issues/1974). Update `/docs/` folder to `/media/` and delete unused images, by [@corinagum](https://github.com/corinagum) in PR [#1975](https://github.com/microsoft/BotFramework-WebChat/pull/1975)
-  Fixes [#1980](https://github.com/microsoft/BotFramework-WebChat/issues/1980). Changed `sendBoxTextArea` styles to break words longer than the `textarea`, by [@tdurnford](https://github.com/tdurnford) in PR [#1986](https://github.com/microsoft/BotFramework-WebChat/pull/1986)
-  Fixes [#1969](https://github.com/microsoft/BotFramework-WebChat/issues/1969). Move `styleSet`s related to Adaptive Cards to full bundle, by [@corinagum](https://github.com/corinagum) in PR [#1987](https://github.com/microsoft/BotFramework-WebChat/pull/1987)
-  Fixes [#1429](https://github.com/microsoft/BotFramework-WebChat/issues/1429). Changed Markdown-It options to render newline characters correctly, by [@tdurnford](https://github.com/tdurnford) in PR [#1988](https://github.com/microsoft/BotFramework-WebChat/pull/1988)
-  Fixes [#1736](https://github.com/microsoft/BotFramework-WebChat/issues/1736). Fixed only first activity in a batch is spoken, by [@compulim](https://github.com/compulim) in PR [#2016](https://github.com/microsoft/BotFramework-WebChat/pull/2016)
-  Fixes [#2008](https://github.com/microsoft/BotFramework-WebChat/issues/2008). Fixed playground due to recent eslint changes, by [@compulim](https://github.com/compulim) in PR [#2009](https://github.com/microsoft/BotFramework-WebChat/pull/2009)
-  Fixes [#1876](https://github.com/microsoft/BotFramework-WebChat/issues/1876). Accessibility fixes on Web Chat transcript, by [@corinagum](https://github.com/corinagum) in PR [#2018](https://github.com/microsoft/BotFramework-WebChat/pull/2018)
-  Fixes [#1829](https://github.com/microsoft/BotFramework-WebChat/issues/1829). Fixed long text not being synthesized by Cognitive Services by bumping to [`react-say@1.2.0`](https://github.com/compulim/react-say), by [@compulim](https://github.com/compulim) in PR [#2035](https://github.com/microsoft/BotFramework-WebChat/pull/2035)
-  Fixes [#1982](https://github.com/microsoft/BotFramework-WebChat/issues/1982). Move to prettier! by [@corinagum](https://github.com/corinagum) in PR [#2038](https://github.com/microsoft/BotFramework-WebChat/pull/2038)
-  Fixes [#1429](https://github.com/microsoft/BotFramework-WebChat/issues/1429). Added Markdown string preprocessing so the renderer will respect CRLF carriage returns (\r\n), by [@tdurnford](https://github.com/tdurnford) in PR [#2055](https://github.com/microsoft/BotFramework-WebChat/pull/2055)
-  Fixes [#2057](https://github.com/microsoft/BotFramework-WebChat/issues/2057). Added `sip:` protocol to sanitize HTML options, by [@tdurnford](https://github.com/tdurnford) in PR [#2061](https://github.com/microsoft/BotFramework-WebChat/pull/2061)
-  Fixes [#2062](https://github.com/microsoft/BotFramework-WebChat/issues/2062). Fixed Markdown rendering issue in cards, by [@tdurnford](https://github.com/tdurnford) in PR [#2063](https://github.com/microsoft/BotFramework-WebChat/pull/2063)
-  Fixes [#1896](https://github.com/microsoft/BotFramework-WebChat/issues/1896). Added data schema to render base64 images, by [@denscollo](https://github.com/denscollo) in PR[#2067](https://github.com/microsoft/BotFramework-WebChat/pull/2067)
-  Fixes [#2068](https://github.com/microsoft/BotFramework-WebChat/issues/2068). Fixed Adaptive Cards validate and rich card speak issues, by [@tdurnford](https://github.com/tdurnford) in PR [#2075](https://github.com/microsoft/BotFramework-WebChat/pull/2075)
-  Fixes [#1966](https://github.com/microsoft/BotFramework-WebChat/issues/1966). Update Localization files for es-ES, ja-JP, zh-HANS, zh-HANT, zh-YUE, by [@corinagum](https://github.com/corinagum) in PR [#2077](https://github.com/microsoft/BotFramework-WebChat/pull/2077)
-  Fixes [#2078](https://github.com/microsoft/BotFramework-WebChat/issues/2078). Update Localization files for tr-TR by [@vefacaglar](https://github.com/vefacaglar)
-  Fixes [#2069](https://github.com/microsoft/BotFramework-WebChat/issues/2069). Fixed Markdown renderer issue in playground, by [@tdurnford](https://github.com/tdurnford) in PR[#2073](https://github.com/microsoft/BotFramework-WebChat/pull/2073)
-  Fixes [#1971](https://github.com/microsoft/BotFramework-WebChat/issues/1971). Fix mobile UX of Sendbox, SendButton, and SuggestedAction focus, by [@corinagum](https://github.com/corinagum) in PR [#2087](https://github.com/microsoft/BotFramework-WebChat/pull/2087)
-  Fixes [#1627](https://github.com/microsoft/BotFramework-WebChat/issues/1627). Fixed timestamps randomly stopped from updating, by [@compulim](https://github.com/compulim) in PR [#2090](https://github.com/microsoft/BotFramework-WebChat/pull/2090)
-  Fixes [#2001](https://github.com/microsoft/BotFramework-WebChat/issues/2001). Strip Markdown from ARIA labels, so screen readers do not speak Markdown in text, by [@corinagum](https://github.com/corinagum) in PR [#2096](https://github.com/microsoft/BotFramework-WebChat/pull/2096)
-  Fixes [#1926](https://github.com/microsoft/BotFramework-WebChat/issues/1926). Fixed scroll stickiness issue when submitting an Adaptive Card form with suggested actions opened, by [@compulim](https://github.com/compulim) in PR [#2107](https://github.com/microsoft/BotFramework-WebChat/pull/2107)
-  Fixes [#2110](https://github.com/microsoft/BotFramework-WebChat/issues/2110). Fixed sendBox input/textarea background color issue, by [@tdurnford](https://github.com/tdurnford) in PR [#2111](https://github.com/microsoft/BotFramework-WebChat/pull/2111)
-  Fixes [#2104](https://github.com/microsoft/BotFramework-WebChat/issues/2104). Remove deprecated `/master/webchat**.js` links from samples, by [@corinagum](https://github.com/corinagum) in PR [#2105](https://github.com/microsoft/BotFramework-WebChat/pull/2105)
-  Fixes [#1863](https://github.com/microsoft/BotFramework-WebChat/issues/1863). Remove title, subtitle, and text of cards from being spoken by [@corinagum](https://github.com/corinagum) in PR [#2118](https://github.com/microsoft/BotFramework-WebChat/pull/2118)
-  Fixes [#2134](https://github.com/microsoft/BotFramework-WebChat/issues/2134). Added `azure-pipelines.yml` for embed package, by [@compulim](https://github.com/compulim) in PR [#2135](https://github.com/microsoft/BotFramework-WebChat/pull/2135)
-  Fixes [#2106](https://github.com/microsoft/BotFramework-WebChat/issues/2016). Fix `AdaptiveCardHostConfig` warning associated with the `CommonCard` component, by [@tdurnford](https://github.com/tdurnford) in PR [#2108](https://github.com/microsoft/BotFramework-WebChat/pull/2108)
-  Fixes [#1872](https://github.com/microsoft/BotFramework-WebChat/issues/1872). Fixed `observeOnce` to unsubscribe properly, by [@compulim](https://github.com/compulim) in PR [#2140](https://github.com/microsoft/BotFramework-WebChat/pull/2140)
-  Fixes [#2022](https://github.com/microsoft/BotFramework-WebChat/issues/2022). Fixed `"expectingInput"` in `inputHint` is not respected, by [@compulim](https://github.com/compulim) and [@corinagum](https://github.com/corinagum) in PR [#2149](https://github.com/microsoft/BotFramework-WebChat/pull/2149) and PR [#2166](https://github.com/microsoft/BotFramework-WebChat/pull/2166)

### Samples

-  `*`: [Single sign-on for enterprise apps](https://microsoft.github.io/BotFramework-WebChat/07.advanced-web-chat-apps/b.sso-for-enterprise/), by [@compulim](https://github.com/compulim) in [#2002](https://github.com/microsoft/BotFramework-WebChat/pull/2002)
-  `*`: [Upload to Azure Storage](https://microsoft.github.io/BotFramework-WebChat/07.advanced-web-chat-apps/a.upload-to-azure-storage/), by [@compulim](https://github.com/compulim) in [#2127](https://github.com/microsoft/BotFramework-WebChat/pull/2127)
-  `*`: [Speech UI demo](https://microsoft.github.io/BotFramework-WebChat/06.recomposing-ui/b.speech-ui). Reconfigured to use Cognitive Services properly, by [@compulim](https://github.com/compulim) in PR [#2132](https://github.com/microsoft/BotFramework-WebChat/pull/2132)
-  `*`: [Single sign-on for Intranet apps](https://microsoft.github.io/BotFramework-WebChat/07.advanced-web-chat-apps/c.sso-for-intranet/), by [@compulim](https://github.com/compulim) in [#2144](https://github.com/microsoft/BotFramework-WebChat/pull/2144)
-  `*`: [Change locale on-the-fly](https://microsoft.github.io/BotFramework-WebChat/22.customization-change-locale/), by [@compulim](https://github.com/compulim) in [#2451](https://github.com/microsoft/BotFramework-WebChat/pull/2451)

## [4.4.1] - 2019-05-02

### Added

-  Adds handling of reconnection, by [@compulim](https://github.com/compulim), in PR [#1880](https://github.com/microsoft/BotFramework-WebChat/pull/1880)
-  Adds embed page, by [@compulim](https://github.com/compulim), in PR [#1910](https://github.com/microsoft/BotFramework-WebChat/pull/1910), PR [#1928](https://github.com/microsoft/BotFramework-WebChat/pull/1928) and PR [#1938](https://github.com/microsoft/BotFramework-WebChat/pull/1938)

### Changed

-  Deployment: Bumps to [`blobxfer@1.7.1`](https://github.com/azure/blobxfer/), by [@compulim](https://github.com/compulim), in PR [#1897](https://github.com/microsoft/BotFramework-WebChat/pull/1897)
-  Deployment: Adds `charset` to content type of JavaScript files on CDN, by [@compulim](https://github.com/compulim), in PR [#1897](https://github.com/microsoft/BotFramework-WebChat/pull/1897)
-  `component`: Bumps to [`react-film@1.2.1-master.db29968`](https://npmjs.com/package/react-film/), by [@corinagum](https://github.com/corinagum) and [@compulim](https://github.com/compulim), in PR [#1900](https://github.com/microsoft/BotFramework-WebChat/pull/1900) and PR [#1924](https://github.com/microsoft/BotFramework-WebChat/pull/1924)
-  Build: Bumps to [`@babel/*`](https://babeljs.io/), by [@corinagum](https://github.com/corinagum), in PR [#1918](https://github.com/microsoft/BotFramework-WebChat/pull/1918)
-  `component`: Carousel flippers on carousel layout and suggested actions will use initial cursor style, by [@compulim](https://github.com/compulim), in PR [#1924](https://github.com/microsoft/BotFramework-WebChat/pull/1924)

### Fixed

-  Fixes [#1423](https://github.com/microsoft/BotFramework-WebChat/issues/1423). Added sample for hosting WebChat in Angular, by [@omarsourour](https://github.com/omarsourour) in PR [#1813](https://github.com/microsoft/BotFramework-WebChat/pull/1813)
-  Fixes[#1767](https://github.com/microsoft/BotFramework-WebChat/issues/1767). Remove `cursor: pointer` from buttons, by [@corinagum](https://github.com/corinagum) in PR [#1819](https://github.com/microsoft/BotFramework-WebChat/pull/1819)
-  Fixes [#1774](https://github.com/microsoft/BotFramework-WebChat/issues/1774). Add `styleSetOption` to allow word break. Default to `break-word`, by [@corinagum](https://github.com/corinagum) in PR [#1832](https://github.com/microsoft/BotFramework-WebChat/pull/1832)
-  Fixes [#1847](https://github.com/microsoft/BotFramework-WebChat/issues/1847). Bump react-say, which adds babel-runtime dependency, by [@corinagum](https://github.com/corinagum) in PR [#1849](https://github.com/microsoft/BotFramework-WebChat/pull/1849)
-  Adds [#1524](https://github.com/microsoft/BotFramework-WebChat/issues/1524) Add Offline UI: connecting for the first time, by [@corinagum](https://github.com/corinagum), in PR [#1866](https://github.com/microsoft/BotFramework-WebChat/pull/1866)
-  Fixes [#1768](https://github.com/microsoft/BotFramework-WebChat/issues/1768). Add style options to be able to modify all Send Box borders, by [@corinagum](https://github.com/corinagum) in PR [#1871](https://github.com/microsoft/BotFramework-WebChat/pull/1871)
-  Fixes [#1827](https://github.com/microsoft/BotFramework-WebChat/issues/1827). Remove renderer for unknown activities, by [@corinagum](https://github.com/corinagum) in PR [#1873](https://github.com/microsoft/BotFramework-WebChat/pull/1873)
-  Fixes [#1586](https://github.com/microsoft/BotFramework-WebChat/issues/1586). Fix theming of suggested actions buttons, by [@corinagum](https://github.com/corinagum) in PR [#1883](https://github.com/microsoft/BotFramework-WebChat/pull/1883)
-  Fixes [#1837](https://github.com/microsoft/BotFramework-WebChat/issues/1837), [#1643](https://github.com/microsoft/BotFramework-WebChat/issues/1643). Fix style conflicts with bootstrap and bump `memoize-one`, by [@corinagum](https://github.com/corinagum) in PR [#1884](https://github.com/microsoft/BotFramework-WebChat/pull/1884)
-  Fixes [#1877](https://github.com/microsoft/BotFramework-WebChat/issues/1877). Add viewport meta tag and fix a few sample links, by [@corinagum](https://github.com/corinagum) in PR [#1919](https://github.com/microsoft/BotFramework-WebChat/pull/1919)
-  Fixes [#1789](https://github.com/microsoft/BotFramework-WebChat/issues/1789). Focus send box after message is being sent, by [@corinagum](https://github.com/corinagum) in PR [#1915](https://github.com/microsoft/BotFramework-WebChat/pull/1915)
-  Fixes [#1920](https://github.com/microsoft/BotFramework-WebChat/issues/1920). Added disabled property to send button, by [@tdurnford](https://github.com/tdurnford) in PR [#1922](https://github.com/microsoft/BotFramework-WebChat/pull/1922)
-  Fixes [#1525](https://github.com/microsoft/BotFramework-WebChat/issues/1525). Add JavaScript error Offline UI, by [@corinagum](https://github.com/corinagum) in PR [#1927](https://github.com/microsoft/BotFramework-WebChat/pull/1927)
-  Fixes [#1934](https://github.com/microsoft/BotFramework-WebChat/issues/1934). Fix spacing of empty ConnectivityStatus component, by [@corinagum](https://github.com/corinagum) in PR [#1939](https://github.com/microsoft/BotFramework-WebChat/pull/1939)
-  Fixes [#1943](https://github.com/microsoft/BotFramework-WebChat/issues/1943). Fix extra vertical padding in IE11 and Firefox, by [@compulim](https://github.com/compulim) in PR [#1949](https://github.com/microsoft/BotFramework-WebChat/pull/1949)
-  Fixes [#1945](https://github.com/microsoft/BotFramework-WebChat/issues/1945). QA fixes for 4.4, by [@corinagum](https://github.com/johndoe) in PR [#1950](https://github.com/microsoft/BotFramework-WebChat/pull/1950)
-  Fixes [#1947](https://github.com/microsoft/BotFramework-WebChat/issues/1947). Fix scrollbar in suggested action should be hidden in Firefox, remove gaps, and use style set for customizing `react-film`, by [@compulim](https://github.com/compulim) in PR [#1953](https://github.com/microsoft/BotFramework-WebChat/pull/1953)
-  Fixes [#1948](https://github.com/microsoft/BotFramework-WebChat/issues/1948). Fixed sample 04.api/g.chat-send-history to work with Firefox and Microsoft Edge, by [@tdurnford](https://github.com/tdurnford) in PR [#1956](https://github.com/microsoft/BotFramework-WebChat/pull/1956)
-  Fixes [#1304](https://github.com/microsoft/BotFramework-WebChat/issues/1304). Move Adaptive Cards from component to bundle, by [@compulim](https://github.com/compulim) and [@corinagum](https://github.com/corinagum) in PR [#1936](https://github.com/microsoft/BotFramework-WebChat/pull/1936)
-  Fixes [#1990](https://github.com/microsoft/BotFramework-WebChat/issues/1990). Bump Adaptive Cards & fix textarea font-family from monospace to Web Chat's `primaryFont`, by [@corinagum](https://github.com/corinagum) in PR [#2064](https://github.com/microsoft/BotFramework-WebChat/pull/2064)

## [4.3.0] - 2019-03-04

### Added

-  Resolves [#1383](https://github.com/microsoft/BotFramework-WebChat/issues/1383). Added options to hide upload button, by [@compulim](https://github.com/compulim) in PR [#1491](https://github.com/microsoft/BotFramework-WebChat/pull/1491)
-  Adds support of avatar image, thru `styleOptions.botAvatarImage` and `styleOptions.userAvatarImage`, in PR [#1486](https://github.com/microsoft/BotFramework-WebChat/pull/1486)
-  Adds ability to style sendbox background and text color, thru `styleOptions.sendBoxBackground` and `styleOptions.sendBoxTextColor`, in PR [#1575](https://github.com/microsoft/BotFramework-WebChat/pull/1575)
-  `core`: Adds `sendEvent`, in PR [#1286](https://github.com/microsoft/BotFramework-WebChat/pull/1286)
-  `core`: Adds `CONNECT_FULFILLING` action to workaround `redux-saga` [design decision](https://github.com/redux-saga/redux-saga/issues/1651), in PR [#1286](https://github.com/microsoft/BotFramework-WebChat/pull/1286)
-  `component`: Added missing Spanish (es-ES) by [@schgressive](https://github.com/schgressive) in PR [#1615](https://github.com/microsoft/BotFramework-WebChat/pull/1615)
-  Adds missing Spanish (es-ES) by [@schgressive](https://github.com/schgressive) in PR [#1615](https://github.com/microsoft/BotFramework-WebChat/pull/1615)
-  Resolves [#1602](https://github.com/microsoft/BotFramework-WebChat/issues/1602). Fix suggested actions regression of buttons, by [@corinagum](https://github.com/corinagum) in PR [#1616](https://github.com/microsoft/BotFramework-WebChat/pull/1616)
-  `component`: Allow font family and adaptive cards text color to be set via styleOptions, by [@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n), in PR [#1670](https://github.com/microsoft/BotFramework-WebChat/pull/1670)
-  `component`: Add fallback logic to browser which do not support `window.Intl`, by [@compulim](https://github.com/compulim), in PR [#1696](https://github.com/microsoft/BotFramework-WebChat/pull/1696)
-  `*`: Adds `username` back to activity, fixed [#1321](https://github.com/microsoft/BotFramework-WebChat/issues/1321), by [@compulim](https://github.com/compulim), in PR [#1682](https://github.com/microsoft/BotFramework-DirectLineJS/pull/1682)
-  `component`: Allow root component height and width customization via `styleOptions.rootHeight` and `styleOptions.rootWidth`, by [@tonyanziano](https://github.com/tonyanziano), in PR [#1702](https://github.com/microsoft/BotFramework-WebChat/pull/1702)
-  `component`: Added `cardActionMiddleware` to customize the behavior of card action, by [@compulim](https://github.com/compulim), in PR [#1704](https://github.com/microsoft/BotFramework-WebChat/pull/1704)
-  `bundle`: Add `watermark` and `streamUrl` parameters to createDirectLine, by [@corinagum](https://github.com/corinagum), in PR [#1817](https://github.com/microsoft/BotFramework-WebChat/pull/1817)
-  `component`: Added `textarea` option to `SendBox` per issues [#17](https://github.com/microsoft/BotFramework-WebChat/issues/17) and [#124](https://github.com/microsoft/BotFramework-WebChat/issues/124), by [@tdurnford](https://github.com/tdurnford), in PR [#1889](https://github.com/microsoft/BotFramework-WebChat/pull/1889)
-  `component`: Added `suggestedAction` images per issue [#1739](https://github.com/microsoft/BotFramework-WebChat/issues/1739), by [@tdurnford](https://github.com/tdurnford), in PR [#1909](https://github.com/microsoft/BotFramework-WebChat/pull/1909)

### Changed

-  Bumps `botframework-directlinejs` to 0.11.4 in PR [#1783](https://github.com/microsoft/BotFramework-WebChat/pull/1783)
-  Moves `botAvatarImage` and `userAvatarImage` to `styleOptions.botAvatarImage` and `styleOptions.userAvatarImage` respectively, in PR [#1486](https://github.com/microsoft/BotFramework-WebChat/pull/1486)
-  Fixes string interpolation error in Russian localization and fallback for browsers without Intl support by [@odysseus1973](https://github.com/odysseus1973) in PR [#1509](https://github.com/microsoft/BotFramework-WebChat/pull/1509)
-  `playground`: Bumps to [`botframework-directlinejs@0.10.0`](https://github.com/microsoft/BotFramework-DirectLineJS/), in PR [#1511](https://github.com/microsoft/BotFramework-WebChat/pull/1511)
-  `playground`: Bumps to [`react-scripts@2.1.1`](https://npmjs.com/package/react-scripts/), in PR [#1535](https://github.com/microsoft/BotFramework-WebChat/pull/1535)
-  `*`: Bumps to [`adaptivecards@1.1.2`](https://npmjs.com/package/adaptivecards/), in [#1558](https://github.com/microsoft/BotFramework-WebChat/pull/1558)
-  `core`: Fixes [#1344](https://github.com/microsoft/BotFramework-WebChat/issues/1344). Use random user ID if not specified, by [@compulim](https://github.com/compulim) in PR [#1612](https://github.com/microsoft/BotFramework-WebChat/pull/1612)
-  `component`: Bump to [`react-film@1.1.2`](https://npmjs.com/package/react-film/) and [`react-scroll-to-bottom@1.3.1`](https://npmjs.com/package/react-scroll-to-bottom/), by [@compulim](https://github.com/compulim), in PR [#1621](https://github.com/microsoft/BotFramework-WebChat/pull/1621) and PR [#1725](https://github.com/microsoft/BotFramework-WebChat/pull/1725)
-  Expand german by [@matmuenzel](https://github.com/matmuenzel) in PR [#1740](https://github.com/microsoft/BotFramework-WebChat/pull/1740)
-  Update Russian and Japanese by [@corinagum](https://github.com/corinagum) in PR [#1747](https://github.com/microsoft/BotFramework-WebChat/pull/1747)
-  Update Spanish by [@ckgrafico](https://github.com/ckgrafico) in PR [#1757](https://github.com/microsoft/BotFramework-WebChat/pull/1757)
-  Update Danish by [@simon_lfr](https://github.com/LTank) in PR [#1810](https://github.com/microsoft/BotFramework-WebChat/pull/1810)
-  Update Swedish by [@pekspro](https://github.com/pekspro) in PR [#1797](https://github.com/microsoft/BotFramework-WebChat/pull/1797)
-  Update Dutch by [@imicknl](https://github.com/imicknl) in PR [#1812](https://github.com/microsoft/BotFramework-WebChat/pull/1812)

### Fixed

-  Fixes [#1360](https://github.com/microsoft/BotFramework-WebChat/issues/1360). Added `roles` to components of Web Chat, by [@corinagum](https://github.com/corinagum) in PR [#1462](https://github.com/microsoft/BotFramework-WebChat/pull/1462)
-  Fixes [#1409](https://github.com/microsoft/BotFramework-WebChat/issues/1409). Added microphone status as screen reader only text, by [@corinagum](https://github.com/corinagum) in PR [#1490](https://github.com/microsoft/BotFramework-WebChat/pull/1490)
-  Fixes [#1605](https://github.com/microsoft/BotFramework-WebChat/issues/1305), [#1316](https://github.com/microsoft/BotFramework-WebChat/issues/1316), [#1341](https://github.com/microsoft/BotFramework-WebChat/issues/1341), [#1411](https://github.com/microsoft/BotFramework-WebChat/issues/1411). Fix color contrast ratios & downloadIcon narrator accessibility by [@corinagum](https://github.com/corinagum) in PR [#1494](https://github.com/microsoft/BotFramework-WebChat/pull/1494)
-  Fixes [#1264](https://github.com/microsoft/BotFramework-WebChat/issues/1264), [#1308](https://github.com/microsoft/BotFramework-WebChat/issues/1308), [#1318](https://github.com/microsoft/BotFramework-WebChat/issues/1318), [#1334](https://github.com/microsoft/BotFramework-WebChat/issues/1334),[#1425](https://github.com/microsoft/BotFramework-WebChat/issues/1425). Update icons with accessibilty, Sent message accessibility, and fix sample README.md, [@corinagum](https://github.com/corinagum) in PR [#1506](https://github.com/microsoft/BotFramework-WebChat/pull/1506) and [#1542](https://github.com/microsoft/BotFramework-WebChat/pull/1542)
-  Fixes [#1512](https://github.com/microsoft/BotFramework-WebChat/issues/1512). Fix #1512: fix sanitization of anchors (allow title attributes), by [@corinagum](https://github.com/corinagum) in PR [#1530](https://github.com/microsoft/BotFramework-WebChat/pull/1530)
-  Fixes [#1499](https://github.com/microsoft/BotFramework-WebChat/issues/1499).
   -  Fix screen reader handling of name, activity, and timestamp,
   -  `connectCarouselFilmStrip`: Fixed `botAvatarInitials` and `userAvatarInitials` functionality from [recent name change](https://github.com/microsoft/BotFramework-WebChat/pull/1486),
   -  `BasicTranscript`: Fixed user activity should not be recreated after receive ACK from Direct Line,
   -  by [@corinagum](https://github.com/corinagum) in PR [#1528](https://github.com/microsoft/BotFramework-WebChat/pull/1528)
-  `component`: Fix [#1560](https://github.com/microsoft/BotFramework-WebChat/issues/1560), [#1625](https://github.com/microsoft/BotFramework-WebChat/issues/1625) and [#1635](https://github.com/microsoft/BotFramework-WebChat/issues/1635). Fixed carousel layout not showing date and alignment issues, by [@compulim](https://github.com/compulim) in PR [#1561](https://github.com/microsoft/BotFramework-WebChat/pull/1561) and [#1641](https://github.com/microsoft/BotFramework-WebChat/pull/1641)
-  `playground`: Fixes [#1562](https://github.com/microsoft/BotFramework-WebChat/issues/1562). Fixed timestamp grouping "Don't group" and added "Don't show timestamp", by [@compulim](https://github.com/compulim) in PR [#1563](https://github.com/microsoft/BotFramework-WebChat/pull/1563)
-  `component`: Fixes [#1576](https://github.com/microsoft/BotFramework-WebChat/issues/1576). Rich card without `tap` should be rendered properly, by [@compulim](https://github.com/compulim) in PR [#1577](https://github.com/microsoft/BotFramework-WebChat/pull/1577)
-  `core`: Some sagas missed handling successive actions, in PR [#1286](https://github.com/microsoft/BotFramework-WebChat/pull/1286)
-  `core`: `incomingActivitySaga` may throw null-ref exception if the first activity is from user, in PR [#1286](https://github.com/microsoft/BotFramework-WebChat/pull/1286)
-  `component`: Fixes [#1328](https://github.com/microsoft/BotFramework-WebChat/issues/1328). Should not start microphone if input hint is set to `ignoringInput`, in PR [#1286](https://github.com/microsoft/BotFramework-WebChat/pull/1286)
-  `component`: Fixes outgoing typing indicators are not sent and acknowledged properly, in PR [#1286](https://github.com/microsoft/BotFramework-WebChat/pull/1286)
-  Fixes [#1402](https://github.com/microsoft/BotFramework-WebChat/issues/1402). Add `messageBack` support, by [@corinagum](https://github.com/corinagum) in PR [#1581](https://github.com/microsoft/BotFramework-WebChat/pull/1581)
-  Fixes [#1539](https://github.com/microsoft/BotFramework-WebChat/issues/1539). Fix outgoing typing indicators are not sent and acknowledged properly, in PR [#1541](https://github.com/microsoft/BotFramework-WebChat/pull/1541)
-  `component`: Fix [#1547](https://github.com/microsoft/BotFramework-WebChat/issues/1547). Fixed unhandled activity type should be forwarded to custom middleware, by [@compulim](https://github.com/compulim) in PR [#1569](https://github.com/microsoft/BotFramework-WebChat/pull/1569)
-  `playground`: Fix [#1610](https://github.com/microsoft/BotFramework-WebChat/issues/1610). Fixed bot and user avatar initials not working, by [@compulim](https://github.com/compulim) in PR [#1611](https://github.com/microsoft/BotFramework-WebChat/pull/1611)
-  `bundle`: Fix [#1613](https://github.com/microsoft/BotFramework-WebChat/issues/1613). Pass conversationId to DirectLineJS constructor, by [@neetu-das](https://github.com/neetu-das) in PR [#1614](https://github.com/microsoft/BotFramework-WebChat/pull/1614)
-  `component`: Fix [#1626](https://github.com/microsoft/BotFramework-WebChat/issues/1626). Fixed `Number.isNaN` is not available in IE11, by [@compulim](https://github.com/compulim) in PR [#1628](https://github.com/microsoft/BotFramework-WebChat/pull/1628)
-  `bundle`: Fix [#1652](https://github.com/microsoft/BotFramework-WebChat/issues/1652). Pass `pollingInterval` to DirectLineJS constructor, by [@neetu-das](https://github.com/neetu-das) in PR [#1655](https://github.com/microsoft/BotFramework-WebChat/pull/1655)
-  `core`: Reworked logic on connect/disconnect for reliability on handling corner cases, by [@compulim](https://github.com/compulim) in PR [#1649](https://github.com/microsoft/BotFramework-WebChat/pull/1649)
-  `core`: Fix [#1521](https://github.com/microsoft/BotFramework-WebChat/issues/1521). Add connectivity status component and update localization, by [@corinagum](https://github.com/corinagum) in PR [#1679](https://github.com/microsoft/BotFramework-WebChat/pull/1679)
-  `core`: Fix [#1057](https://github.com/microsoft/BotFramework-WebChat/issues/1057). Fixed suggested actions destined for other recipients should not show up, by [@compulim](https://github.com/compulim) in PR [#1706](https://github.com/microsoft/BotFramework-WebChat/pull/1706)
-  `component`: Fixed pt-br locale not being selected, added `X minutes ago` and missing translations, by [@pedropacheco92](https://github.com/pedropacheco92) in PR [#1745](https://github.com/microsoft/BotFramework-WebChat/pull/1745)
-  `component`: Fix [#1741](https://github.com/microsoft/BotFramework-WebChat/issues/1741) where `scrollToEndButton` does not have `type="button"`by [@corinagum](https://github.com/corinagum) in PR [#1743](https://github.com/microsoft/BotFramework-WebChat/pull/1743)
-  `component`: Fix [#1625](https://github.com/microsoft/BotFramework-WebChat/issues/1625) to update `README.md` by [@corinagum](https://github.com/corinagum) in PR [#1752](https://github.com/microsoft/BotFramework-WebChat/pull/1752)

### Removed

-  `botAvatarImage` and `userAvatarImage` props, as they are moved inside `styleOptions`, in PR [#1486](https://github.com/microsoft/BotFramework-WebChat/pull/1486)
-  `sendTyping` props is now renamed to `sendTypingIndicator`, by [@compulim](https://github.com/compulim), in PR [#1584](https://github.com/microsoft/BotFramework-WebChat/pull/1584)

### Samples

-  `core`: [Programmatic access to post activity](https://microsoft.github.io/BotFramework-WebChat/04.api/d.post-activity-event/), in [#1568](https://github.com/microsoft/BotFramework-WebChat/pull/1568)
-  `component`: [Hide upload button](https://microsoft.github.io/BotFramework-WebChat/02.branding-styling-and-customization/f.hide-upload-button/), in [#1491](https://github.com/microsoft/BotFramework-WebChat/pull/1491)
-  `component`: [Avatar image](https://microsoft.github.io/BotFramework-WebChat/02.branding-styling-and-customization/d.display-sender-images/), in [#1486](https://github.com/microsoft/BotFramework-WebChat/pull/1486)
-  `core`: [Incoming activity to JavaScript event](https://microsoft.github.io/BotFramework-WebChat/04.api/c.incoming-activity-event/), in [#1567](https://github.com/microsoft/BotFramework-WebChat/pull/1567)
-  `core`: [Send welcome event](https://microsoft.github.io/BotFramework-WebChat/15.b.backchannel-send-welcome-event/), in PR [#1286](https://github.com/microsoft/BotFramework-WebChat/pull/1286)
-  `core`: [Send typing indicator](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/b.send-typing-indicator), in [#1541](https://github.com/microsoft/BotFramework-WebChat/pull/1541)
-  `component`: [Password input activity](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/f.password-input/), in [#1569](https://github.com/microsoft/BotFramework-WebChat/pull/1569)
-  `*`: Updated [minimizable Web Chat](https://microsoft.github.io/BotFramework-WebChat/06.recomposing-ui/a.minimizable-web-chat/) sample to use `WEB_CHAT/SEND_EVENT` action, in [#1631](https://github.com/microsoft/BotFramework-WebChat/pull/1631)
-  `component`: [Hybrid speech engine](https://microsoft.github.io/BotFramework-WebChat/06.f.hybrid-speech/), in [#1617](https://github.com/microsoft/BotFramework-WebChat/pull/1617)
-  `component`: Use Speech Services token for [speech UI sample](https://microsoft.github.io/BotFramework-WebChat/06.recomposing-ui/b.speech-ui/), in [#1634](https://github.com/microsoft/BotFramework-WebChat/pull/1634)
-  `component`: [Selectable Activity](https://microsoft.github.io/BotFramework-WebChat/04.api/f.selectable-activity/), in [#1624](https://github.com/microsoft/BotFramework-WebChat/pull/1624)
-  `component`: [Chat Send History](https://microsoft.github.io/BotFramework-WebChat/04.api/g.chat-send-history/), in [#1678](https://github.com/microsoft/BotFramework-WebChat/pull/1678)
-  `*`: Update `README.md`'s for samples 05-10 [#1444](https://github.com/microsoft/BotFramework-WebChat/issues/1444) and improve accessibility of anchors [#1681](https://github.com/microsoft/BotFramework-WebChat/issues/1681), by [@corinagum](https://github.com/corinagum) in PR [#1710](https://github.com/microsoft/BotFramework-WebChat/pull/1710)
-  `component`: [Customizing open URL behavior](https://microsoft.github.io/BotFramework-WebChat/04.api/i.open-url), in PR [#1704](https://github.com/microsoft/BotFramework-WebChat/pull/1704)

## [4.2.0] - 2018-12-11

### Added

-  Build: Development build now include instrumentation code, updated build scripts
   -  `npm run build` will build for development with instrumentation code
   -  `npm run prepublishOnly` will build for production
   -  `npm run watch` will also run Webpack in watch loop
-  Build: Automated testing using visual regression testing technique in [#1323](https://github.com/microsoft/BotFramework-WebChat/pull/1323)
   -  [Docker-based](https://github.com/SeleniumHQ/docker-selenium) automated testing using headless Chrome and [Web Driver](https://npmjs.com/packages/selenium-webdriver)
   -  Screenshot comparison using [`jest-image-snapshot`](https://npmjs.com/packages/jest-image-snapshot) and [`pixelmatch`](https://npmjs.com/package/pixelmatch)
   -  Code is instrumented using [`istanbul`](https://npmjs.com/package/istanbul)
   -  Test report is hosted on [Coveralls](https://coveralls.io/github/microsoft/BotFramework-WebChat)
-  Added French localization, by [@tao1](https://github.com/tao1) in PR [#1327](https://github.com/microsoft/BotFramework-WebChat/pull/1327)
-  Resolve [#1344](https://github.com/microsoft/BotFramework-WebChat/issues/1344), by updating `README.md` and adding validation logic for `userID` props, in [#1447](https://github.com/microsoft/BotFramework-WebChat/pull/1447)
   -  If `userID` props present and also embedded in Direct Line token, will use the one from Direct Line token
   -  If `userID` props present, they must be string and not prefixed with `dl_`, to avoid confusion between `userID` props and Direct Line embedded user ID (which is forgery-proof)
   -  If `userID` props does not pass the validation test or not specified, Web Chat will use `default-user` instead
-  Added support for Cognitive Services Speech to Text and Text to Speech in PR [#1442](https://github.com/microsoft/BotFramework-WebChat/pull/1442)

### Changed

-  Core: Saga will run after custom middleware, in [#1331](https://github.com/microsoft/BotFramework-WebChat/pull/1331)
   -  Custom middleware run before saga to allow user to modify default behavior
-  Build: Bump dependencies, in [#1303](https://github.com/microsoft/BotFramework-WebChat/pull/1303)
   -  `@babel`
      -  `@babel/cli@7.1.2`
      -  `@babel/core@7.1.2`
      -  `@babel/plugin-proposal-class-properties@7.1.0`
      -  `@babel/plugin-proposal-object-rest-spread@7.0.0`
      -  `@babel/plugin-transform-runtime@7.1.0`
      -  `@babel/preset-env@7.1.0`
      -  `@babel/preset-react@7.0.0`
      -  `@babel/preset-typescript@7.1.0`
      -  `@babel/runtime@7.1.2`
   -  `concurrently@4.0.1`
   -  `jest`
      -  `babel-jest@23.6.0`
      -  `jest@23.6.0`
      -  `ts-jest@23.10.4`
   -  `typescript@3.1.6`
   -  `webpack`
      -  `webpack@4.24.0`
      -  `webpack-command@0.4.2`
-  Fixes Russian localization by [@odysseus1973](https://github.com/odysseus1973) in PR [#1377](https://github.com/microsoft/BotFramework-WebChat/pull/1377)

### Fixed

-  Fixes [#1397](https://github.com/microsoft/BotFramework-WebChat/issues/1397). Patched activities without `from` field, in PR [#1405](https://github.com/microsoft/BotFramework-WebChat/pull/1405)
-  Fixes [#1237](https://github.com/microsoft/BotFramework-WebChat/issues/1237). Added new sample called `migration`, by [@corinagum](https://github.com/corinagum) in PR [#1398](https://github.com/microsoft/BotFramework-WebChat/pull/1398)
-  Fixes [#1332](https://github.com/microsoft/BotFramework-WebChat/issues/1332). Updated sample names and add table to README, by [@corinagum](https://github.com/corinagum) in PR [#1435](https://github.com/microsoft/BotFramework-WebChat/pull/1435)
-  Fixes [#1125](https://github.com/microsoft/BotFramework-WebChat/issues/1125). Added error handling for Adaptive Card JSON render, by [@corinagum](https://github.com/corinagum) in PR [#1395](https://github.com/microsoft/BotFramework-WebChat/pull/1395)
-  Build: Webpack watch mode now emits non-minified code for shorter dev RTT, in [#1331](https://github.com/microsoft/BotFramework-WebChat/pull/1331)

### Samples

-  Backchannel: [Inject custom data into every `POST_ACTIVITY`](https://microsoft.github.io/BotFramework-WebChat/15.backchannel-piggyback-on-outgoing-activities/), in [#1331](https://github.com/microsoft/BotFramework-WebChat/pull/1331)
-  UI: [Minimizable Web Chat](https://microsoft.github.io/BotFramework-WebChat/06.recomposing-ui/a.minimizable-web-chat/), in [#1290](https://github.com/microsoft/BotFramework-WebChat/pull/1290)
-  Others: [Using Web Chat v3](https://microsoft.github.io/BotFramework-WebChat/webchat-v3/), in [#1287](https://github.com/microsoft/BotFramework-WebChat/pull/1287)
-  Speech: [Cognitive Services Speech to Text and Text to Speech](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/06.c.cognitive-services-speech-services-js) (both subscription key and authorization token flow)
-  Speech: [Cognitive Services Speech to Text using lexical result](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/06.e.cognitive-services-speech-services-with-lexical-result) (text normalization)

## [4.1.0] - 2018-10-31

### Added

-  Initial release of Web Chat v4
