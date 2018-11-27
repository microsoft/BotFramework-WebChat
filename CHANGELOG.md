# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Development build now include instrumentation code, updated build scripts
   - `npm run build` will build for development with instrumentation code
   - `npm run prepublishOnly` will build for production
   - `npm run watch` will also run Webpack in watch loop
- Automated testing using visual regression testing technique
   - [Docker-based](https://github.com/SeleniumHQ/docker-selenium) automated testing using headless Chrome and [Web Driver](https://npmjs.com/packages/selenium-webdriver)
   - Screenshot comparison using [`jest-image-snapshot`](https://npmjs.com/packages/jest-image-snapshot) and [`pixelmatch`](https://npmjs.com/package/pixelmatch)
   - Code is instrumented using [`istanbul`](https://npmjs.com/package/istanbul)
   - Test report is hosted on [Coveralls](https://coveralls.io/github/compulim/BotFramework-WebChat)

### Changed
- Bump dependencies, in [#1303](https://github.com/Microsoft/BotFramework-WebChat/pull/1303)
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
- Fix [#1237](https://github.com/Microsoft/BotFramework-WebChat/issues/1237). Added new sample called `markdown`, by [@corinagum](https://github.com/corinagum) in PR [#1398](https://github.com/Microsoft/BotFramework-WebChat/pull/1398)

## [4.1.0] - 2018-10-31
### Added
- Initial release of Web Chat v4
