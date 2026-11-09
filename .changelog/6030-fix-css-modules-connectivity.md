### Changed

- Converted the connectivity status to CSS Modules with `webchat__` class names and its style options to custom properties, in PR [#6030](https://github.com/microsoft/BotFramework-WebChat/pull/6030), by [@OEvgeny](https://github.com/OEvgeny)

### Removed

- 💥 Deprecated the `connectivityNotification`, `errorNotification`, `spinnerAnimation` and `warningNotification` style set entries, which no longer affect rendering, and removed 3 `--rtl` classes, in PR [#6030](https://github.com/microsoft/BotFramework-WebChat/pull/6030), by [@OEvgeny](https://github.com/OEvgeny)

### Fixed

- Fixed the connectivity status spinner and "slow connection" icon touching their text in right-to-left, in PR [#6030](https://github.com/microsoft/BotFramework-WebChat/pull/6030), by [@OEvgeny](https://github.com/OEvgeny)
