# botframework-webchat

[![npm version](https://badge.fury.io/js/botframework-webchat.svg)](https://badge.fury.io/js/botframework-webchat) [![Build Status](https://travis-ci.org/Microsoft/BotFramework-WebChat.svg?branch=master)](https://travis-ci.org/Microsoft/BotFramework-WebChat)

# To-do

- Backend
   - Direct Line JS
      - [x] Travis CI NPM
      - [ ] Optional: Bring your own fetch
      - [ ] Optional: Bring your own Web Socket
   - [Redux](https://github.com/Microsoft/BotFramework-WebChat/tree/v4/packages/backend)
      - [x] Retry send
      - [ ] Send typing
      - [ ] Optional: Connectivity
      - [ ] Optional: Bring your own Direct Line
      - [x] Samples
         - [x] CLI
         - [x] Speech-only
      - [ ] Parity check
- Frontend
   - [React](https://github.com/Microsoft/BotFramework-WebChat/tree/v4/packages/component)
      - [ ] Activity Renderer
         - [x] Bubble and avatar
         - [ ] Adaptive Cards
            - [x] Submit
            - [x] JSON card
            - [x] Tap
            - [x] Host config
            - [ ] Rich card
               - [x] Sign-in
               - [ ] OAuth
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
         - [ ] Speech say
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
   - [ ] NPM
   - [ ] CDN
      - [ ] Everything
      - [ ] Minimal
- Testing
   - [x] [Hosted Web Chat](https://webchat-playground.azurewebsites.net/)
   - [ ] Mocking Direct Line
   - [ ] Visual regression tests
      - [ ] BrowserStack
   - [ ] MockBot
      - [x] [GitHub CI/CD](https://travis-ci.org/compulim/BotFramework-MockBot/)
      - [x] [Hosted MockBot](https://webchat-mockbot.azurewebsites.net/)
         - [x] Token exchange
         - [x] Docker
      - [x] Parity check

# Contributions

Like us? [Star](https://github.com/Microsoft/BotFramework-WebChat/stargazers) us.

Want to make it better? [File](https://github.com/Microsoft/BotFramework-WebChat/issues) us an issue.

Don't like something you see? [Submit](https://github.com/Microsoft/BotFramework-WebChat/pulls) a pull request.
