### Fixed

- Fixed [#5696](https://github.com/microsoft/BotFramework-WebChat/issues/5696), receipt card text being truncated when text spacing is increased: line items, facts, and amounts now wrap instead of being cut off with an ellipsis, even when `richCardWrapTitle` is `false`; the price column of items with an image is now as wide as in other rows, and each fact is its own row so its key and value stay aligned, in PR [#5886](https://github.com/microsoft/BotFramework-WebChat/pull/5886), by [@OEvgeny](https://github.com/OEvgeny)
