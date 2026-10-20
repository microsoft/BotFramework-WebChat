### Fixed

- Fixed syntax-highlighted code having less than 4.5:1 color contrast: comments in the light code block theme (`github-light-default`) were 4.36:1 in the Fluent theme and now use the muted text color of the theme, `#656d76` (5.03:1), in PR [#5893](https://github.com/microsoft/BotFramework-WebChat/pull/5893), by [@OEvgeny](https://github.com/OEvgeny)
- Fixed code blocks becoming empty when Web Chat is rendered with messages already in the store, such as again with the same store or from a saved state: code is shown without highlighting until the syntax highlighter is loaded, in PR [#5893](https://github.com/microsoft/BotFramework-WebChat/pull/5893), by [@OEvgeny](https://github.com/OEvgeny)
