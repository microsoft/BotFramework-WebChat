### Changed

- Built `botframework-directlinespeech-sdk` with tsup only, replacing Babel and webpack, in PR [#6045](https://github.com/microsoft/BotFramework-WebChat/pull/6045), by [@OEvgeny](https://github.com/OEvgeny)

### Removed

- 💥 `botframework-directlinespeech-sdk` no longer ships Babel's `lib/` folder: deep imports from `lib/` stop working where `exports` is ignored (webpack 4), in PR [#6045](https://github.com/microsoft/BotFramework-WebChat/pull/6045), by [@OEvgeny](https://github.com/OEvgeny)
