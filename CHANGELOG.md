# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Build: Development build now include instrumentation code, updated build scripts
   - `npm run build` will build for development with instrumentation code
   - `npm run prepublishOnly` will build for production
   - `npm run watch` will also run Webpack in watch loop
- Build: Automated testing using visual regression testing technique
   - [Docker-based](https://github.com/SeleniumHQ/docker-selenium) automated testing using headless Chrome and [Web Driver](https://npmjs.com/packages/selenium-webdriver)
   - Screenshot comparison using [`jest-image-snapshot`](https://npmjs.com/packages/jest-image-snapshot) and [`pixelmatch`](https://npmjs.com/package/pixelmatch)
   - Code is instrumented using [`istanbul`](https://npmjs.com/package/istanbul)
   - Test report is hosted on [Coveralls](https://coveralls.io/github/compulim/BotFramework-WebChat)
- Add French localization, by [@tao1](https://github.com/tao1) in PR [#1327](https://github.com/Microsoft/BotFramework-WebChat/pull/1327)

### Changed
- Core: Saga will run after custom middleware, in [#1331](https://github.com/Microsoft/BotFramework-WebChat/pull/1331)
   - Custom middleware run before saga to allow user to modify default behavior
- Build: Bump dependencies, in [#1303](https://github.com/Microsoft/BotFramework-WebChat/pull/1303)
   - `@babel`
      - `@babel/cli@7.1.2`
      - `@babel/core@7.1.2`
      - `@babel/plugin-proposal-class-properties@7.1.0`
      - `@babel/plugin-proposal-object-rest-spread@7.0.0`
      - `@babel/plugin-transform-runtime@7.1.0`
      - `@babel/preset-env@7.1.0`
      - `@babel/preset-react@7.0.0`
      - `@babel/preset-typescript@7.1.0`
      - `@babel/runtime@7.1.2`
   - `concurrently@4.0.1`
   - `jest`
      - `babel-jest@23.6.0`
      - `jest@23.6.0`
      - `ts-jest@23.10.4`
   - `typescript@3.1.6`
   - `webpack`
      - `webpack@4.24.0`
      - `webpack-command@0.4.2`
- Fix Russian localization by [@odysseus1973](https://github.com/odysseus1973) in PR [#1377](https://github.com/Microsoft/BotFramework-WebChat/pull/1377)

### Fixed
- Fix [#1397](https://github.com/Microsoft/BotFramework-WebChat/issues/1397/) by patching activities without `from` field, in PR [#1405](https://github.com/Microsoft/BotFramework-WebChat/pull/1405)
- Fix [#1237](https://github.com/Microsoft/BotFramework-WebChat/issues/1237). Added new sample called `migration`, by [@corinagum](https://github.com/corinagum) in PR [#1398](https://github.com/Microsoft/BotFramework-WebChat/pull/1398)
- Fix sample names and add table to README; resolves [Issue #1332](https://github.com/Microsoft/BotFramework-WebChat/issues/1332) by [@corinagum](https://github.com/corinagum) in PR [#1435](https://github.com/Microsoft/BotFramework-WebChat/pull/1435)

### Fixed
- Build: Webpack watch mode now emits non-minified code for shorter dev RTT, in [#1331](https://github.com/Microsoft/BotFramework-WebChat/pull/1331)

### Samples
- Backchannel: Inject custom data into every `POST_ACTIVITY`, in [#1331](https://github.com/Microsoft/BotFramework-WebChat/pull/1331)
- UI: Minimize mode, in [#1290](https://github.com/Microsoft/BotFramework-WebChat/pull/1290)
- Others: Use Web Chat v3, in [#1287](https://github.com/Microsoft/BotFramework-WebChat/pull/1287)

## [4.1.0] - 2018-10-31
### Added
- Initial release of Web Chat v4
