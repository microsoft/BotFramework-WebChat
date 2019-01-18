# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!-- CHANGELOG line template
### Added/Changed/Removed
- Added something, by [@johndoe](https://github.com/johndoe), in PR [#XXX](https://github.com/Microsoft/BotFramework-WebChat/pull/XXX)

### Changed (for dependency bumps)
- `core`: Bumps to [`abc@1.2.3`](https://npmjs.com/package/abc/), in PR [#XXX](https://github.com/Microsoft/BotFramework-WebChat/pull/XXX)

### Fixed
- Fix [#XXX](https://github.com/Microsoft/BotFramework-WebChat/issues/XXX). Patched something, by [@johndoe](https://github.com/johndoe) in PR [#XXX](https://github.com/Microsoft/BotFramework-WebChat/pull/XXX)
-->

## [Unreleased]
### Added
- Fix [#1383](https://github.com/Microsoft/BotFramework-WebChat/issues/1383). Added options to hide upload button, by [@compulim](https://github.com/compulim) in PR [#1491](https://github.com/Microsoft/BotFramework-WebChat/pull/1491)
- Added support of avatar image, thru `styleOptions.botAvatarImage` and `styleOptions.userAvatarImage`, in PR [#1486](https://github.com/Microsoft/BotFramework-WebChat/pull/1486)
- Added ability to style sendbox background and text color, thru `styleOptions.sendBoxBackground` and `styleOptions.sendBoxTextColor`, in PR [#1575](https://github.com/Microsoft/BotFramework-WebChat/pull/1575)
- `core`: Added `sendEvent`, in PR [#1286](https://github.com/Microsoft/BotFramework-WebChat/pull/1286)
- `core`: Added `CONNECT_FULFILLING` action to workaround `redux-saga` [design decision](https://github.com/redux-saga/redux-saga/issues/1651), in PR [#1286](https://github.com/Microsoft/BotFramework-WebChat/pull/1286)
- `component`: Added missing Spanish (es-ES) locale by [@schgressive](https://github.com/schgressive) in PR [#1615](https://github.com/Microsoft/BotFramework-WebChat/pull/1615)
- `samples`: Added selectable chat activity sample, by [@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n), in PR [#1624](https://github.com/Microsoft/BotFramework-WebChat/pull/1624)
- Added missing Spanish (es-ES) locale by [@schgressive](https://github.com/schgressive) in PR [#1615](https://github.com/Microsoft/BotFramework-WebChat/pull/1615)
- Fix [#1602](https://github.com/Microsoft/BotFramework-WebChat/issues/1602). Fix suggested actions regression of buttons, by [@corinagum](https://github.com/corinagum) in PR [#1616](https://github.com/Microsoft/BotFramework-WebChat/pull/1616)
- `core`: Send `conversationUpdate` activity on connect, by [@compulim](https://github.com/compulim), in PR [#XXX](https://github.com/Microsoft/BotFramework-WebChat/pull/XXX)

### Changed
- Moved `botAvatarImage` and `userAvatarImage` to `styleOptions.botAvatarImage` and `styleOptions.userAvatarImage` respectively, in PR [#1486](https://github.com/Microsoft/BotFramework-WebChat/pull/1486)
- Fix string interpolation error in Russian localization and fallback for browsers without Intl support by [@odysseus1973](https://github.com/odysseus1973) in PR [#1509](https://github.com/Microsoft/BotFramework-WebChat/pull/1509)
- `playground`: Bumps to [`botframework-directlinejs@0.10.0`](https://github.com/Microsoft/BotFramework-DirectLineJS/), in PR [#1511](https://github.com/Microsoft/BotFramework-WebChat/pull/1511)
- `playground`: Bumps to [`react-scripts@2.1.1`](https://npmjs.com/package/react-scripts/), in PR [#1535](https://github.com/Microsoft/BotFramework-WebChat/pull/1535)
- `*`: Bump to [`adaptivecards@1.1.2`](https://npmjs.com/package/adaptivecards/), in [#1558](https://github.com/Microsoft/BotFramework-WebChat/pull/1558)
- `core`: Fix [#1344](https://github.com/Microsoft/BotFramework-WebChat/issues/1344). Use random user ID if not specified, by [@compulim](https://github.com/compulim) in PR [#1612](https://github.com/Microsoft/BotFramework-WebChat/pull/1612)
- `component`: Bump to [`react-film@1.1.2`](https://npmjs.com/package/react-film/) and [`react-scroll-to-bottom@1.3.0`](https://npmjs.com/package/react-scroll-to-bottom/), by [@compulim](https://github.com/compulim), in PR [#1621](https://github.com/Microsoft/BotFramework-WebChat/pull/1621)

### Fixed
- Fix [#1360](https://github.com/Microsoft/BotFramework-WebChat/issues/1360). Added `roles` to components of Web Chat, by [@corinagum](https://github.com/corinagum) in PR [#1462](https://github.com/Microsoft/BotFramework-WebChat/pull/1462)
- Fix [#1409](https://github.com/Microsoft/BotFramework-WebChat/issues/1409). Added microphone status as screen reader only text, by [@corinagum](https://github.com/corinagum) in PR [#1490](https://github.com/Microsoft/BotFramework-WebChat/pull/1490)
- Fix [#1605](https://github.com/Microsoft/BotFramework-WebChat/issues/1305), [#1316](https://github.com/Microsoft/BotFramework-WebChat/issues/1316), [#1341](https://github.com/Microsoft/BotFramework-WebChat/issues/1341), [#1411](https://github.com/Microsoft/BotFramework-WebChat/issues/1411). Fix color contrast ratios & downloadIcon narrator accessibility by [@corinagum](https://github.com/corinagum) in PR [#1494](https://github.com/Microsoft/BotFramework-WebChat/pull/1494)
- Fix [#1264](https://github.com/Microsoft/BotFramework-WebChat/issues/1264), [#1308](https://github.com/Microsoft/BotFramework-WebChat/issues/1308), [#1318](https://github.com/Microsoft/BotFramework-WebChat/issues/1318), [#1334](https://github.com/Microsoft/BotFramework-WebChat/issues/1334),[#1425](https://github.com/Microsoft/BotFramework-WebChat/issues/1425). Update icons with accessibilty, Sent message accessibility, and fix sample README.md,  [@corinagum](https://github.com/corinagum) in PR [#1506](https://github.com/Microsoft/BotFramework-WebChat/pull/1506) and [#1542](https://github.com/Microsoft/BotFramework-WebChat/pull/1542)
- Fix [#1512](https://github.com/Microsoft/BotFramework-WebChat/issues/1512). Fix #1512: fix sanitization of anchors (allow title attributes), by [@corinagum](https://github.com/corinagum) in PR [#1530](https://github.com/Microsoft/BotFramework-WebChat/pull/1530)
- Fix [#1499](https://github.com/Microsoft/BotFramework-WebChat/issues/1499).
  - Fix screen reader handling of name, activity, and timestamp,
  - `connectCarouselFilmStrip`: Fixed `botAvatarInitials` and `userAvatarInitials` functionality from [recent name change](https://github.com/Microsoft/BotFramework-WebChat/pull/1486),
  - `BasicTranscript`: Fixed user activity should not be recreated after receive ACK from Direct Line,
  - by [@corinagum](https://github.com/corinagum) in PR [#1528](https://github.com/Microsoft/BotFramework-WebChat/pull/1528)
- `component`: Fix [#1560](https://github.com/Microsoft/BotFramework-WebChat/issues/1560). Fixed carousel layout did not show date and alignment issues, by [@compulim](https://github.com/compulim) in PR [#1561](https://github.com/Microsoft/BotFramework-WebChat/pull/1561)
- `playground`: Fix [#1562](https://github.com/Microsoft/BotFramework-WebChat/issues/1562). Fixed timestamp grouping "Don't group" and added "Don't show timestamp", by [@compulim](https://github.com/compulim) in PR [#1563](https://github.com/Microsoft/BotFramework-WebChat/pull/1563)
- `component`: Fix [#1576](https://github.com/Microsoft/BotFramework-WebChat/issues/1576). Rich card without `tap` should be rendered properly, by [@compulim](https://github.com/compulim) in PR [#1577](https://github.com/Microsoft/BotFramework-WebChat/pull/1577)
- `core`: Some sagas missed handling successive actions, in PR [#1286](https://github.com/Microsoft/BotFramework-WebChat/pull/1286)
- `core`: `incomingActivitySaga` may throw null-ref exception if the first activity is from user, in PR [#1286](https://github.com/Microsoft/BotFramework-WebChat/pull/1286)
- `component`: Fix [#1328](https://github.com/Microsoft/BotFramework-WebChat/issues/1328). Should not start microphone if input hint is set to `ignoringInput`, in PR [#1286](https://github.com/Microsoft/BotFramework-WebChat/pull/1286)
- `component`: Fix outgoing typing indicators are not sent and acknowledged properly, in PR [#1286](https://github.com/Microsoft/BotFramework-WebChat/pull/1286)
- Fix [#1402](https://github.com/Microsoft/BotFramework-WebChat/issues/1402). Add `messageBack` support, by [@corinagum](https://github.com/corinagum) in PR [#1581](https://github.com/Microsoft/BotFramework-WebChat/pull/1581)
- Fix [#1539], outgoing typing indicators are not sent and acknowledged properly, in PR [#1541](https://github.com/Microsoft/BotFramework-WebChat/pull/1541)
- `component`: Fix [#1547](https://github.com/Microsoft/BotFramework-WebChat/issues/1547). Fixed unhandled activity type should be forwarded to custom middleware, by [@compulim](https://github.com/compulim) in PR [#1569](https://github.com/Microsoft/BotFramework-WebChat/pull/1569)
- `playground`: Fix [#1610](https://github.com/Microsoft/BotFramework-WebChat/issues/1610). Fixed bot and user avatar initials not working, by [@compulim](https://github.com/compulim) in PR [#1611](https://github.com/Microsoft/BotFramework-WebChat/pull/1611)
- `bundle`: Fix [#1613](https://github.com/Microsoft/BotFramework-WebChat/issues/1613). Pass conversationId to DirectLineJS constructor, by [@neetu-das](https://github.com/neetu-das) in PR [#1614](https://github.com/Microsoft/BotFramework-WebChat/pull/1614)
- `component`: Fix [#1626](https://github.com/Microsoft/BotFramework-WebChat/issues/1626). Fixed `Number.isNaN` is not available in IE11, by [@compulim](https://github.com/compulim) in PR [#1628](https://github.com/Microsoft/BotFramework-WebChat/pull/1628)

### Removed
- `botAvatarImage` and `userAvatarImage` props, as they are moved inside `styleOptions`, in PR [#1486](https://github.com/Microsoft/BotFramework-WebChat/pull/1486)

### Samples
- `core`: [Programmatic access to post activity](https://microsoft.github.io/BotFramework-WebChat/15.c.programmatic-post-activity/), in [#1568](https://github.com/Microsoft/BotFramework-WebChat/pull/1568)
- `component`: [Hide upload button](https://microsoft.github.io/BotFramework-WebChat/05.d.hide-upload-button-styling/), in [#1491](https://github.com/Microsoft/BotFramework-WebChat/pull/1491)
- `component`: [Avatar image](https://microsoft.github.io/BotFramework-WebChat/04.b.display-user-bot-images-styling/), in [#1486](https://github.com/Microsoft/BotFramework-WebChat/pull/1486)
- `core`: [Incoming activity to JavaScript event](https://microsoft.github.io/BotFramework-WebChat/15.b.incoming-activity-event/), in [#1567](https://github.com/Microsoft/BotFramework-WebChat/pull/1567)
- `core`: [Send welcome event](https://microsoft.github.io/BotFramework-WebChat/15.b.backchannel-send-welcome-event/), in PR [#1286](https://github.com/Microsoft/BotFramework-WebChat/pull/1286)
- `core`: [Send typing indicator](https://microsoft.github.io/BotFramework-WebChat/07.b.customization-send-typing-indicator), in [#1541](https://github.com/Microsoft/BotFramework-WebChat/pull/1541)
- `component`: [Password input activity](https://microsoft.github.io/BotFramework-WebChat/10.b.customization-password-input/), in [#1569](https://github.com/Microsoft/BotFramework-WebChat/pull/1569)
- `*`: Updated [minimizable Web Chat](https://microsoft.github.io/BotFramework-WebChat/12.customization-minimizable-web-chat/) sample to use `WEB_CHAT/SEND_EVENT` action, in [#1631](https://github.com/Microsoft/BotFramework-WebChat/pull/1631)
- `component`: [Hybrid speech engine](https://microsoft.github.io/BotFramework-WebChat/06.f.hybrid-speech/), in [#1617](https://github.com/Microsoft/BotFramework-WebChat/pull/1617)
- `component`: Use Speech Services token for [speech UI sample](https://microsoft.github.io/BotFramework-WebChat/13.customization-speech-ui/), in [#1634](https://github.com/Microsoft/BotFramework-WebChat/pull/1634)

## [4.2.0] - 2018-12-11
### Added
- Build: Development build now include instrumentation code, updated build scripts
   - `npm run build` will build for development with instrumentation code
   - `npm run prepublishOnly` will build for production
   - `npm run watch` will also run Webpack in watch loop
- Build: Automated testing using visual regression testing technique in [#1323](https://github.com/Microsoft/BotFramework-WebChat/pull/1323)
   - [Docker-based](https://github.com/SeleniumHQ/docker-selenium) automated testing using headless Chrome and [Web Driver](https://npmjs.com/packages/selenium-webdriver)
   - Screenshot comparison using [`jest-image-snapshot`](https://npmjs.com/packages/jest-image-snapshot) and [`pixelmatch`](https://npmjs.com/package/pixelmatch)
   - Code is instrumented using [`istanbul`](https://npmjs.com/package/istanbul)
   - Test report is hosted on [Coveralls](https://coveralls.io/github/compulim/BotFramework-WebChat)
- Added French localization, by [@tao1](https://github.com/tao1) in PR [#1327](https://github.com/Microsoft/BotFramework-WebChat/pull/1327)
- Fix [#1344](https://github.com/Microsoft/BotFramework-WebChat/issues/1344), by updating `README.md` and adding validation logic for `userID` props, in [#1447](https://github.com/Microsoft/BotFramework-WebChat/pull/1447)
   - If `userID` props present and also embedded in Direct Line token, will use the one from Direct Line token
   - If `userID` props present, they must be string and not prefixed with `dl_`, to avoid confusion between `userID` props and Direct Line embedded user ID (which is forgery-proof)
   - If `userID` props does not pass the validation test or not specified, Web Chat will use `default-user` instead
- Added support for Cognitive Services Speech to Text and Text to Speech in PR [#1442](https://github.com/Microsoft/BotFramework-WebChat/pull/1442)

### Changed
- Core: Saga will run after custom middleware, in [#1331](https://github.com/Microsoft/BotFramework-WebChat/pull/1331)
   - Custom middleware run before saga to allow user to modify default behavior
- Build: Bump dependencies, in [#1303](https://github.com/Microsoft/BotFramework-WebChat/pull/1303)
   - `@babel`
      - `@babel/cli@7.1.2`
      - `@babel/core@7.1.2`
      - `@babel/plugin-proposal-class-properties@7.1.0`
      - `@babel/plugin-proposal-object-rest-spread@7.0.0`
      - `@babel/plugin-transform-runtime@7.1.0`
      - `@babel/preset-env@7.1.0`
      - `@babel/preset-react@7.0.0`
      - `@babel/preset-typescript@7.1.0`
      - `@babel/runtime@7.1.2`
   - `concurrently@4.0.1`
   - `jest`
      - `babel-jest@23.6.0`
      - `jest@23.6.0`
      - `ts-jest@23.10.4`
   - `typescript@3.1.6`
   - `webpack`
      - `webpack@4.24.0`
      - `webpack-command@0.4.2`
- Fix Russian localization by [@odysseus1973](https://github.com/odysseus1973) in PR [#1377](https://github.com/Microsoft/BotFramework-WebChat/pull/1377)

### Fixed
- Fix [#1397](https://github.com/Microsoft/BotFramework-WebChat/issues/1397). Patched activities without `from` field, in PR [#1405](https://github.com/Microsoft/BotFramework-WebChat/pull/1405)
- Fix [#1237](https://github.com/Microsoft/BotFramework-WebChat/issues/1237). Added new sample called `migration`, by [@corinagum](https://github.com/corinagum) in PR [#1398](https://github.com/Microsoft/BotFramework-WebChat/pull/1398)
- Fix [#1332](https://github.com/Microsoft/BotFramework-WebChat/issues/1332). Updated sample names and add table to README, by [@corinagum](https://github.com/corinagum) in PR [#1435](https://github.com/Microsoft/BotFramework-WebChat/pull/1435)
- Fix [#1125](https://github.com/Microsoft/BotFramework-WebChat/issues/1125). Added error handling for Adaptive Card JSON render, by [@corinagum](https://github.com/corinagum) in PR [#1395](https://github.com/Microsoft/BotFramework-WebChat/pull/1395)
- Build: Webpack watch mode now emits non-minified code for shorter dev RTT, in [#1331](https://github.com/Microsoft/BotFramework-WebChat/pull/1331)

### Samples
- Backchannel: [Inject custom data into every `POST_ACTIVITY`](https://microsoft.github.io/BotFramework-WebChat/15.backchannel-piggyback-on-outgoing-activities/), in [#1331](https://github.com/Microsoft/BotFramework-WebChat/pull/1331)
- UI: [Minimizable Web Chat](https://microsoft.github.io/BotFramework-WebChat/12.customization-minimizable-web-chat/), in [#1290](https://github.com/Microsoft/BotFramework-WebChat/pull/1290)
- Others: [Using Web Chat v3](https://microsoft.github.io/BotFramework-WebChat/webchat-v3/), in [#1287](https://github.com/Microsoft/BotFramework-WebChat/pull/1287)
- Speech: [Cognitive Services Speech to Text and Text to Speech](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/6.c.cognitive-services-speech-services-js) (both subscription key and authorization token flow)
- Speech: [Cognitive Services Speech to Text using lexical result](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/6.e.cognitive-services-speech-services-with-lexical-result) (text normalization)

## [4.1.0] - 2018-10-31
### Added
- Initial release of Web Chat v4
