# botframework-webchat

[![npm version](https://badge.fury.io/js/botframework-webchat.svg)](https://badge.fury.io/js/botframework-webchat) [![Build Status](https://travis-ci.org/Microsoft/BotFramework-WebChat.svg?branch=master)](https://travis-ci.org/Microsoft/BotFramework-WebChat)

# Roadmap

## Parity

- [ ] Adaptive Cards: Emit `load` event when image is loaded
- [ ] Adaptive Cards: Emit `click` event except `A`/`AUDIO`/`VIDEO`/`BUTTON`/`INPUT`/`LABEL`/`TEXTAREA`/`SELECT`
- [ ] Adaptive Cards: Focus on transcript DOM after card action so the user can continue typing on
- [ ] Select activity UI and API, could be a sample or canned
- [ ] Fix Markdown before Markdown-It
   - [ ] Convert `<br>` to `\n`
   - [ ] URL encode all links, e.g. `[abc](abc def)` should be `[abc](abc%20def)`
   - [ ] Render lines with empty spaces correctly, e.g. `abc\n \ndef`
- [ ] Use `inputHint` for handsfree mode: `expectingInput` should retrigger microphone
- [ ] Migrate translations

## Chores

- [ ] Revisit `connect()`
   - [ ] Can we eliminate all Redux selectors and move them to `Composer`?
      - [ ] Or, call we eliminate all populated properties and move them to Redux?
         - E.g. `settings.language`
      - [ ] Look at speak code first, we migh tnot able to eliminate all Redux selectors due to speak code
   - [ ] Can we eliminate all dispatch and use actions dispatcher from `Composer`?
- [ ] Deprecate "locale" prop and rename it to "language"
- [ ] Customization localization strings

# Contributions

Like us? [Star](https://github.com/Microsoft/BotFramework-WebChat/stargazers) us.

Want to make it better? [File](https://github.com/Microsoft/BotFramework-WebChat/issues) us an issue.

Don't like something you see? [Submit](https://github.com/Microsoft/BotFramework-WebChat/pulls) a pull request.
