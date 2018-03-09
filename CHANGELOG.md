# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Customizable chat title thru `props.chatTitle`, either `true`/`false` or a string, by [@shade33](https://github.com/shade33) in [PR #810](https://github.com/Microsoft/BotFramework-WebChat/pull/810) and [PR #875](https://github.com/Microsoft/BotFramework-WebChat/pull/875)
- Options to show/hide upload button thru `props.showUploadButton`, in [PR #883](https://github.com/Microsoft/BotFramework-WebChat/pull/883)
- Packaging with source maps with inlined source, by [@PiWiBardy](https://github.com/PiWiBardy) in [PR #842](https://github.com/Microsoft/BotFramework-WebChat/pull/842) and [PR #878](https://github.com/Microsoft/BotFramework-WebChat/pull/878)
- Translations
  - `cs-cz`, by [Martin Simecek](https://github.com/msimecek) in [PR #809](https://github.com/Microsoft/BotFramework-WebChat/pull/809)
  - `fi-fi`, by [Julius Suominen](https://github.com/jsur) in [PR #853](https://github.com/Microsoft/BotFramework-WebChat/pull/853)
  - `fr-fr`, by [@jalamanac](https://github.com/jalamanac) in [PR #818](https://github.com/Microsoft/BotFramework-WebChat/pull/818)
  - `nb-no`, by [Trond Aarskog](https://github.com/taarskog) in [PR #820](https://github.com/Microsoft/BotFramework-WebChat/pull/820)
  - `nl-nl`, by [Mick Vleeshouwer](https://github.com/iMicknl) in [PR #821](https://github.com/Microsoft/BotFramework-WebChat/pull/821)
  - `pl-pl`, by [Peter Blazejewicz](https://github.com/peterblazejewicz) in [PR #813](https://github.com/Microsoft/BotFramework-WebChat/pull/813)
  - `zh-hans`, by [@Antimoney](https://github.com/Antimoney) in [PR #822](https://github.com/Microsoft/BotFramework-WebChat/pull/822) and [PR #823](https://github.com/Microsoft/BotFramework-WebChat/pull/823)

### Changed
- Update dependencies
  - [`adaptivecards@1.0.0-beta9`](https://www.npmjs.com/package/adaptivecards), in [PR #849](https://github.com/Microsoft/BotFramework-WebChat/pull/849)
  - [`http-server@0.10.0`](https://www.npmjs.com/package/http-server), in [PR #829](https://github.com/Microsoft/BotFramework-WebChat/pull/829)
  - [`microsoft-speech-browser-sdk@0.0.12`](https://www.npmjs.com/package/microsoft-speech-browser-sdk), in [PR #888](https://github.com/Microsoft/BotFramework-WebChat/pull/888)
  - [`nightmare@3.0.0`](https://www.npmjs.com/package/nightmare), in [PR #887](https://github.com/Microsoft/BotFramework-WebChat/pull/887)
  - [`node-sass@4.7.2`](https://www.npmjs.com/package/node-sass), in [PR #873](https://github.com/Microsoft/BotFramework-WebChat/pull/873)
- Fix: Safari on Mac speech synthesis by prefixing `AudioContext`, by [@DerPate2010](https://github.com/DerPate2010) in [PR #865](https://github.com/Microsoft/BotFramework-WebChat/pull/865)
- Fix: clicking microphone button too fast should not fail, by [@shahidkhuram](https://github.com/shahidkhuram) in [PR #657](#657) and [PR #881](https://github.com/Microsoft/BotFramework-WebChat/pull/881)
- Fix: unmount should not throw exception, in [PR #884](https://github.com/Microsoft/BotFramework-WebChat/pull/884)

### Removed
- Deprecated `props.formatOptions.showHeader`, [use `props.chatTitle` instead](#formatoptionsshowheader-is-deprecated-use-chattitle-instead), in [PR #875](https://github.com/Microsoft/BotFramework-WebChat/pull/875)
- NPM `postinstall` steps removed, by [@PiWiBardy](https://github.com/PiWiBardy) in [PR #879](https://github.com/Microsoft/BotFramework-WebChat/pull/879)

# Deprecations

## "formatOptions.showHeader" is deprecated, use "chatTitle" instead

`formatOptions` is a prop that contains `showHeader` only. The `showHeader` is a boolean flag that show/hide the chat title.

Customizable chat title is a [popular](https://github.com/Microsoft/BotFramework-WebChat/issues/754) [ask](https://github.com/Microsoft/BotFramework-WebChat/pull/810), thus, we added it. But instead of using the original `showHeader`, which literally means a boolean. We added `chatTitle` instead. Since `formatOptions` contains only one option `showHeader`, we are deprecating `formatOptions` together.

You can set `chatTitle` to `true` (a default localized chat title), `false` (hide chat title), or a string of your preferred chat title.
