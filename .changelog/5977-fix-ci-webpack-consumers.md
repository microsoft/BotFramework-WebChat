### Added

- 👷🏻 Pull request validation: added rendering Web Chat bundled by esbuild, Vite, webpack 4 and 5 with React 16, 18 and 19, in PR [#5977](https://github.com/microsoft/BotFramework-WebChat/pull/5977), by [@OEvgeny](https://github.com/OEvgeny)
- Docs: added [workarounds for webpack 4](./docs/HOSTING.md#bundling-with-webpack-4), in PR [#5977](https://github.com/microsoft/BotFramework-WebChat/pull/5977), by [@OEvgeny](https://github.com/OEvgeny)

### Changed

- `botframework-webchat-core` connects to Redux DevTools without the `@redux-devtools/extension` package, in PR [#5977](https://github.com/microsoft/BotFramework-WebChat/pull/5977), by [@OEvgeny](https://github.com/OEvgeny)

### Fixed

- Fixed webpack 4 failing to resolve `botframework-webchat/schema.js` and `@redux-devtools/extension`, in PR [#5977](https://github.com/microsoft/BotFramework-WebChat/pull/5977), by [@OEvgeny](https://github.com/OEvgeny)
