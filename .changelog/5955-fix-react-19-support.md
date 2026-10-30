### Added

- Added [#5552](https://github.com/microsoft/BotFramework-WebChat/issues/5552) and [#5850](https://github.com/microsoft/BotFramework-WebChat/issues/5850), support for React 19, in PR [#5955](https://github.com/microsoft/BotFramework-WebChat/pull/5955), by [@OEvgeny](https://github.com/OEvgeny)

### Removed

- Components: removed the remaining `propTypes` and the `prop-types` dependency, React 19 ignores them, in PR [#5955](https://github.com/microsoft/BotFramework-WebChat/pull/5955), by [@OEvgeny](https://github.com/OEvgeny)

### Fixed

- Fixed Adaptive Cards submitting empty inputs in Strict Mode on React 19, in PR [#5955](https://github.com/microsoft/BotFramework-WebChat/pull/5955), by [@OEvgeny](https://github.com/OEvgeny)
- Fixed `Composer` of the full bundle not calling a `children` function with `extraStyleSet`, in PR [#5955](https://github.com/microsoft/BotFramework-WebChat/pull/5955), by [@OEvgeny](https://github.com/OEvgeny)
