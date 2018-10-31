# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.15.0] - 2018-10-31
### Added
- Translations
  - `pt-BR`, by [Diego Castro](https://github.com/dfdcastro) in PR [#1074](https://github.com/Microsoft/BotFramework-WebChat/pull/1074)
- Props to add `tabIndex` to activity in PR [#1161](https://github.com/Microsoft/BotFramework-WebChat/pull/1161)
- Revert [#1166](https://github.com/Microsoft/BotFramework-WebChat/pull/1166) and fix tests, by [@corinagum](https://github.com/corinagum) in PR [#1215](https://github.com/Microsoft/BotFramework-WebChat/pull/1215)

### Changed
- Bump `botframework-directlinejs` to `0.9.17` in PR [#1131](https://github.com/Microsoft/BotFramework-WebChat/pull/1131)
- Fix `historyRef` cannot be focused because it is unmounted in Emulator, in PR [#1157](https://github.com/Microsoft/BotFramework-WebChat/pull/1157)
- Fix for Chatdown that activities sent by the user are not displayed, in PR [#1162](https://github.com/Microsoft/BotFramework-WebChat/pull/1162)
- Accessibility adjustment on `History.tsx` where clickable `<div>` is converted to `<button>`, by [@corinagum](https://github.com/corinagum) in PR [#1166](https://github.com/Microsoft/BotFramework-WebChat/pull/1166)
- Fix so that carousel buttons are updated on load, by [@corinagum](https://github.com/corinagum) in PR [#1188](https://github.com/Microsoft/BotFramework-WebChat/pull/1188)
- Move `react` and `react-dom` to `peerDependencies` in [#1202](https://github.com/Microsoft/BotFramework-WebChat/pull/1202)
   - The host page should already include `react` and `react-dom` as dependencies
   - Bundle with `react@16.5.2` and `react-dom@16.5.2`
- Bump dependencies to fix vulnerability issues in [#1202](https://github.com/Microsoft/BotFramework-WebChat/pull/1202)
   - `gulp@^4.0.0`
   - `http-server@^0.11.1`
   - `node-sass@^4.9.3`
- Fix [#1029](https://github.com/Microsoft/BotFramework-WebChat/issues/1029), translation for time strings in PR [#1140](https://git, by [@curia-damiano]hub.com/Microsoft/BotFramework-WebChat/pull/1140), by [@curia-damiano]
- Bump [`botframework-directlinejs`](https://github.com/Microsoft/BotFramework-DirectLineJS/) to `0.10.0` in PR [#XXX](https://github.com/Microsoft/BotFramework-WebChat/pull/XXX)

## [0.14.2] - 2018-08-16
### Added
- Add `disabled` props to disable all controls in PR [#988](https://github.com/Microsoft/BotFramework-WebChat/pull/988)
- Add `role === 'user'` to `fromMe` check in [#1053](https://github.com/Microsoft/BotFramework-WebChat/pull/1053)

### Changed
- Update `PULL_REQUEST_TEMPLATE.md` [@corinagum](https://github.com/corinagum) in PR [#1065](https://github.com/Microsoft/BotFramework-WebChat/pull/1065)
- Update WebRTC check by `navigator.getUserMedia` and `navigator.mediaDevices.getUserMedia`, by [@rosskyl](https://github.com/rosskyl) in [#1026](https://github.com/Microsoft/BotFramework-WebChat/pull/1026)

## [0.14.1] - 2018-07-31
### Added
- Bump [`node-sass`](https://github.com/sass/node-sass) to `4.9.2`, by [@corinagum](https://github.com/corinagum) in PR [#1043](https://github.com/Microsoft/BotFramework-WebChat/pull/1043)
- Add TSLint, by [@adeogunsamuel](https://github.com/adeogunsamuel) in [#1017](https://github.com/Microsoft/BotFramework-WebChat/pull/1017)

### Changed
- Fix typo in `de-DE`, by [@jKelio](https://github.com/jKelio) in [#1022](https://github.com/Microsoft/BotFramework-WebChat/pull/1022)
- Fix [#1045](https://github.com/Microsoft/BotFramework-WebChat/issues/1045) IE11 uploading twice, in [#1046](https://github.com/Microsoft/BotFramework-WebChat/pull/1046)
- Fix [#949](https://github.com/Microsoft/BotFramework-WebChat/issues/949), [#972](https://github.com/Microsoft/BotFramework-WebChat/issues/972), and [#1030](https://github.com/Microsoft/BotFramework-WebChat/issues/1030) to bring [Markdown-It](https://github.com/markdown-it/markdown-it) to Adaptive Cards, in [#1034](https://github.com/Microsoft/BotFramework-WebChat/pull/1034)

## [0.14.0] - 2018-06-26
### Added
- Standard and ES5-polyfill builds are now available on CDN
   - Production build
      - [https://cdn.botframework.com/botframework-webchat/latest/botchat.js](https://cdn.botframework.com/botframework-webchat/latest/botchat.js)
      - [https://cdn.botframework.com/botframework-webchat/latest/botchat-es5.js](https://cdn.botframework.com/botframework-webchat/latest/botchat-es5.js)
   - Development build
      - [https://cdn.botframework.com/botframework-webchat/master/botchat.js](https://cdn.botframework.com/botframework-webchat/master/botchat.js)
      - [https://cdn.botframework.com/botframework-webchat/master/botchat-es5.js](https://cdn.botframework.com/botframework-webchat/master/botchat-es5.js)

### Changed
- Fix [#997](https://github.com/Microsoft/BotFramework-WebChat/issues/997) to postpone size measurement while hidden, in [#1003](https://github.com/Microsoft/BotFramework-WebChat/pull/1003)
- Fix [#1006](https://github.com/Microsoft/BotFramework-WebChat/issues/1006) links in README.md to reference `web-chat` instead of `webchat`, by [@AlexanderEllis](https://github.com/AlexanderEllis) in [#980](https://github.com/Microsoft/BotFramework-WebChat/pull/980)

## [0.13.1] - 2018-05-01
### Changed
- Fix [#963](https://github.com/Microsoft/BotFramework-WebChat/issues/963) not to send empty `dgi.Groups` to Cognitive Services, in [#965](https://github.com/Microsoft/BotFramework-WebChat/pull/965)
- Fix [#964](https://github.com/Microsoft/BotFramework-WebChat/issues/964) to include `.d.ts` in `tsconfig.json` instead of `<reference>`, in [#966](https://github.com/Microsoft/BotFramework-WebChat/pull/966)

## [0.13.0] - 2018-04-26
### Added
- Support of `OAuthCard`, in [#954](https://github.com/Microsoft/BotFramework-WebChat/pull/954)
### Changed
- Updated [`botframework-directlinejs@0.9.15`](https://www.npmjs.com/package/botframework-directlinejs), in [#953](https://github.com/Microsoft/BotFramework-WebChat/pull/953)

## [0.12.1] - 2018-04-16
### Added
- Add `listenFor` speech recognizer hint for both Cognitive Services and Web Speech API

### Changed
- Fix [#870](https://github.com/Microsoft/BotFramework-WebChat/issues/870) not to show empty bubble, in [#917](https://github.com/Microsoft/BotFramework-WebChat/pull/917)
- Fix [#924](https://github.com/Microsoft/BotFramework-WebChat/issues/924) not showing upload button by default, in [#938](https://github.com/Microsoft/BotFramework-WebChat/pull/938)

## [0.12.0] - 2018-03-21
### Added
- [#754](https://github.com/Microsoft/BotFramework-WebChat/issues/754) Customizable chat title thru `props.chatTitle`, either `true`/`false` or a string, by [@shade33](https://github.com/shade33) in [PR #810](https://github.com/Microsoft/BotFramework-WebChat/pull/810) and [PR #875](https://github.com/Microsoft/BotFramework-WebChat/pull/875)
- [#798](https://github.com/Microsoft/BotFramework-WebChat/issues/798) Options to show/hide upload button thru `props.showUploadButton`, in [PR #883](https://github.com/Microsoft/BotFramework-WebChat/pull/883)
- Packaging with source maps with inlined source, by [@PiWiBardy](https://github.com/PiWiBardy) in [PR #842](https://github.com/Microsoft/BotFramework-WebChat/pull/842) and [PR #878](https://github.com/Microsoft/BotFramework-WebChat/pull/878)
- Translations
  - `cs-cz`, by [Martin Simecek](https://github.com/msimecek) in [PR #809](https://github.com/Microsoft/BotFramework-WebChat/pull/809)
  - `fi-fi`, by [Julius Suominen](https://github.com/jsur) in [PR #853](https://github.com/Microsoft/BotFramework-WebChat/pull/853)
  - `fr-fr`, by [@jalamanac](https://github.com/jalamanac) in [PR #818](https://github.com/Microsoft/BotFramework-WebChat/pull/818)
  - `nb-no`, by [Trond Aarskog](https://github.com/taarskog) in [PR #820](https://github.com/Microsoft/BotFramework-WebChat/pull/820)
  - `nl-nl`, by [Mick Vleeshouwer](https://github.com/iMicknl) in [PR #821](https://github.com/Microsoft/BotFramework-WebChat/pull/821)
  - `pl-pl`, by [Peter Blazejewicz](https://github.com/peterblazejewicz) in [PR #813](https://github.com/Microsoft/BotFramework-WebChat/pull/813)
  - `zh-hans`, by [@Antimoney](https://github.com/Antimoney) in [PR #822](https://github.com/Microsoft/BotFramework-WebChat/pull/822) and [PR #823](https://github.com/Microsoft/BotFramework-WebChat/pull/823)
- Promise polyfill with [bluebird](https://www.npmjs.com/package/bluebird) if needed in [#911](https://github.com/Microsoft/BotFramework-WebChat/pull/911)

### Changed
- Update dependencies
  - [`adaptivecards@1.0.0`](https://www.npmjs.com/package/adaptivecards), in [PR #849](https://github.com/Microsoft/BotFramework-WebChat/pull/849) and [PR #899](https://github.com/Microsoft/BotFramework-WebChat/pull/899)
  - [`http-server@0.10.0`](https://www.npmjs.com/package/http-server), in [PR #829](https://github.com/Microsoft/BotFramework-WebChat/pull/829)
  - [`microsoft-speech-browser-sdk@0.0.12`](https://www.npmjs.com/package/microsoft-speech-browser-sdk), in [PR #888](https://github.com/Microsoft/BotFramework-WebChat/pull/888)
  - [`nightmare@3.0.0`](https://www.npmjs.com/package/nightmare), in [PR #887](https://github.com/Microsoft/BotFramework-WebChat/pull/887)
  - [`node-sass@4.7.2`](https://www.npmjs.com/package/node-sass), in [PR #873](https://github.com/Microsoft/BotFramework-WebChat/pull/873)
- Fix: Safari on Mac speech synthesis by prefixing `AudioContext`, by [@DerPate2010](https://github.com/DerPate2010) in [PR #865](https://github.com/Microsoft/BotFramework-WebChat/pull/865)
- Fix [#654](https://github.com/Microsoft/BotFramework-WebChat/issues/654): clicking microphone button too fast should not fail, by [@shahidkhuram](https://github.com/shahidkhuram) in [PR #657](#657), [PR #881](https://github.com/Microsoft/BotFramework-WebChat/pull/881) and [PR #895](https://github.com/Microsoft/BotFramework-WebChat/pull/895)
- Fix [#894](https://github.com/Microsoft/BotFramework-WebChat/issues/894): Chrome not speaking malformed SSML on Adaptive Cards `speak` property, in [PR #895](https://github.com/Microsoft/BotFramework-WebChat/pull/895)
- Fix [#866](https://github.com/Microsoft/BotFramework-WebChat/issues/866): unmount should not throw exception, in [PR #884](https://github.com/Microsoft/BotFramework-WebChat/pull/884)
- Cleanup: `dependencies` and `devDependencies` in both `package.json` and `test/package.json` is much cleaner and independent of each other, in [PR #893](https://github.com/Microsoft/BotFramework-WebChat/pull/893)
- Fix [#906](https://github.com/Microsoft/BotFramework-WebChat/issues/906): Add type="button" to `<button>`, in [#910](https://github.com/Microsoft/BotFramework-WebChat/pull/910)

### Removed
- Deprecated `props.formatOptions.showHeader`, [use `props.chatTitle` instead](#formatoptionsshowheader-is-deprecated-use-chattitle-instead), in [PR #875](https://github.com/Microsoft/BotFramework-WebChat/pull/875)
- [#855](https://github.com/Microsoft/BotFramework-WebChat/issues/855) NPM `postinstall` steps removed, by [@PiWiBardy](https://github.com/PiWiBardy) in [PR #879](https://github.com/Microsoft/BotFramework-WebChat/pull/879)

# Deprecations

## "formatOptions.showHeader" is deprecated, use "chatTitle" instead

`formatOptions` is a prop that contains `showHeader` only. The `showHeader` is a boolean flag that show/hide the chat title.

Customizable chat title is a [popular](https://github.com/Microsoft/BotFramework-WebChat/issues/754) [ask](https://github.com/Microsoft/BotFramework-WebChat/pull/810), thus, we added it. But instead of using the original `showHeader`, which literally means a boolean. We added `chatTitle` instead. Since `formatOptions` contains only one option `showHeader`, we are deprecating `formatOptions` together.

You can set `chatTitle` to `true` (a default localized chat title), `false` (hide chat title), or a string of your preferred chat title.
