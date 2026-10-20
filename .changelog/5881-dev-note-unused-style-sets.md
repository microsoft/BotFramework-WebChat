### Removed

- 💥 Style set entries that are no longer used for rendering since 4.19.0 are being deprecated, in PR [#5881](https://github.com/microsoft/BotFramework-WebChat/pull/5881), by [@OEvgeny](https://github.com/OEvgeny). They will be removed on or after 2028-10-16
   - `activityButton`, `activityCopyButton`, `basicTranscript`, `bubble`, `carouselFilmStrip`, `carouselFilmStripAttachment`, `carouselFlipper`, `citationModalDialog`, `linkDefinitions`, `renderMarkdown`, `sendStatus`, `stackedLayout`, `textContent`, and `thumbButton`
   - Full bundle: `adaptiveCardRenderer`, `animationCardAttachment`, and `audioCardAttachment`
   - Customizing these entries has no effect, please use style options instead
