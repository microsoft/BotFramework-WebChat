### Changed

- Converted the chat history box, image avatar, error box, transcript list and media attachments to CSS Modules with `webchat__` class names, and `videoHeight` to `--webchat__height--video`, in PR [#6024](https://github.com/microsoft/BotFramework-WebChat/pull/6024), by [@OEvgeny](https://github.com/OEvgeny)

### Removed

- 💥 Deprecated the `activities`, `audioAttachment`, `audioContent`, `chatHistoryBox`, `errorBox`, `imageAvatar`, `videoAttachment`, `videoContent`, `vimeoContent` and `youTubeContent` style set entries, which no longer affect rendering, and removed the unused `webchat__chat-history-box__toolbar--rtl` class, in PR [#6024](https://github.com/microsoft/BotFramework-WebChat/pull/6024), by [@OEvgeny](https://github.com/OEvgeny)
