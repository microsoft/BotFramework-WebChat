### Added

- Rich cards: added fill-in of `replyToId` for "IM back", "post back", and "message back" card actions, in PR [#5871](https://github.com/microsoft/BotFramework-WebChat/pull/5871), by [@compulim](https://github.com/compulim)
- `hooks/useSendMessage`: added `replyToId`, in PR [#5871](https://github.com/microsoft/BotFramework-WebChat/pull/5871), by [@compulim](https://github.com/compulim)
- `hooks/useSendMessageBack`: added `replyToId`, in PR [#5871](https://github.com/microsoft/BotFramework-WebChat/pull/5871), by [@compulim](https://github.com/compulim)

### Changed

- 💥 `useSendMessage`: `init.attachments[].thumbnailURL` must be data URI, otherwise will be ignored, in PR [#5871](https://github.com/microsoft/BotFramework-WebChat/pull/5871), by [@compulim](https://github.com/compulim)
- 👷🏻 Visual regression tests now use 5 consecutive screenshots for stability indication, up from 2, in PR [#5871](https://github.com/microsoft/BotFramework-WebChat/pull/5871), by [@compulim](https://github.com/compulim)
