### Changed

- 💥 Card action buttons the user pressed are styled with the `adaptive-card-renderer__action--selected` class instead of `[aria-pressed='true']`: host CSS that targets `.ac-pushButton[aria-pressed='true']` should target `.ac-pushButton.adaptive-card-renderer__action--selected` instead, in PR [#5900](https://github.com/microsoft/BotFramework-WebChat/pull/5900), by [@OEvgeny](https://github.com/OEvgeny)

### Fixed

- Fixed [#4583](https://github.com/microsoft/BotFramework-WebChat/issues/4583), [#5716](https://github.com/microsoft/BotFramework-WebChat/issues/5716), [#5719](https://github.com/microsoft/BotFramework-WebChat/issues/5719), [#5745](https://github.com/microsoft/BotFramework-WebChat/issues/5745), and [#5750](https://github.com/microsoft/BotFramework-WebChat/issues/5750), card action buttons being announced as toggle buttons, and Submit being marked as selected when the card's inputs fail validation, in PR [#5900](https://github.com/microsoft/BotFramework-WebChat/pull/5900), by [@OEvgeny](https://github.com/OEvgeny)
