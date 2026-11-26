### Changed

- Built `botframework-webchat` and its `webchat*.js` scripts with tsdown instead of tsup: `hooks`, `Components`, `decorator`, `internal` and `middleware` are now module namespace objects, which cannot be extended, in PR [#6088](https://github.com/microsoft/BotFramework-WebChat/pull/6088), by [@OEvgeny](https://github.com/OEvgeny)
