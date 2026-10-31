### Changed

- Converted the tooltip, modal dialog, file attachment and transcript root classes to CSS Modules, keeping their `webchat__` class names, so Fluent styles them through the CSS module theme, in PR [#5997](https://github.com/microsoft/BotFramework-WebChat/pull/5997), by [@OEvgeny](https://github.com/OEvgeny)

### Removed

- 💥 Style set entries `modalDialog` and `tooltip` are no longer used for rendering and are being deprecated, customizing them has no effect, they will be removed on or after 2028-10-16; their styles moved to CSS modules that keep the `webchat__modal-dialog` and `webchat__tooltip` class names, which hosts can style instead, in PR [#5997](https://github.com/microsoft/BotFramework-WebChat/pull/5997), by [@OEvgeny](https://github.com/OEvgeny)
