### Changed

- Converted the root and its layout to CSS Modules and the root style options to custom properties, in PR [#6072](https://github.com/microsoft/BotFramework-WebChat/pull/6072), by [@OEvgeny](https://github.com/OEvgeny)

### Removed

- 💥 Deprecated the `root` style set entry, which no longer affects rendering: pass `backgroundColor` and `root*` options in `styleOptions`, not only to `createStyleSet()`, in PR [#6072](https://github.com/microsoft/BotFramework-WebChat/pull/6072), by [@OEvgeny](https://github.com/OEvgeny)
