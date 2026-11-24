### Changed

- 💥 Replaced `redux-saga` in core's store with plain JavaScript that keeps the same actions in the same order: apps that import `redux-saga` without declaring it must add it, and actions that Web Chat puts no longer carry redux-saga's hidden `@@redux-saga/SAGA_ACTION` property, in PR [#6081](https://github.com/microsoft/BotFramework-WebChat/pull/6081), by [@OEvgeny](https://github.com/OEvgeny)
