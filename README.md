# botframework-webchat

[![npm version](https://badge.fury.io/js/botframework-webchat.svg)](https://badge.fury.io/js/botframework-webchat) [![Build Status](https://travis-ci.org/Microsoft/BotFramework-WebChat.svg?branch=master)](https://travis-ci.org/Microsoft/BotFramework-WebChat)

# To-do

## Features

- Backend
   - Direct Line JS
      - [x] Travis CI NPM
      - [ ] Optional: Bring your own fetch
      - [ ] Optional: Bring your own Web Socket
   - [Redux](https://github.com/Microsoft/BotFramework-WebChat/tree/v4/packages/backend)
      - [x] Retry send
      - [x] Send typing
      - [ ] Optional: Connectivity
      - [ ] Optional: Bring your own Direct Line
      - [x] Samples
         - [x] CLI
         - [x] Speech-only
      - [x] Parity check
- Frontend
   - [React](https://github.com/Microsoft/BotFramework-WebChat/tree/v4/packages/component)
      - [x] Activity Renderer
         - [x] Registries
            - [x] Custom activity renderer
            - [x] Custom attachment renderer
         - [x] Bubble and avatar
         - [x] Adaptive Cards
            - [x] Submit
            - [x] JSON card
            - [x] Tap
            - [x] Host config
            - [x] Rich card
               - [x] Sign-in
               - [x] OAuth
               - [x] Others
         - [x] Media
            - [x] Video
               - [x] MP4
               - [x] Vimeo
               - [x] YouTube
            - [x] Audio
            - [x] Image and animation
            - [x] File download
         - [ ] Scroll to bottom
            - [x] Scroll pane
            - [ ] Programmability
         - [x] Markdown/plain/XML
            - [x] Sanitize HTML
         - [x] Speech say
         - [x] Typing
         - [x] Layout
            - [x] Carousel
            - [x] Stacked
      - [x] Send box
      - [x] File upload
            - [x] Multiple uploads
            - [ ] Optional: drag to upload
      - [x] Suggested actions
            - [x] Show
            - [x] Carousel
            - [x] Submit
      - [x] Microphone
   - [x] Speech engine
      - [x] Speech recognition
      - [x] Speech synthesis
- Bundling
   - [x] NPM
   - [x] CDN
      - [x] Everything
      - [x] Minimal
- Testing
   - [x] [Hosted Web Chat](https://webchat-playground.azurewebsites.net/)
   - [ ] Mocking Direct Line
   - [ ] Visual regression tests
      - [ ] BrowserStack
   - [x] MockBot
      - [x] [GitHub CI/CD](https://travis-ci.org/compulim/BotFramework-MockBot/)
      - [x] [Hosted MockBot](https://webchat-mockbot.azurewebsites.net/)
         - [x] Token exchange
         - [x] Docker
      - [x] Parity check

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
