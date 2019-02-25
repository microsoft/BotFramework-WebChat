<p align="center">
  <a href="https://azure.microsoft.com/en-us/services/bot-service/">
    <img src="https://raw.githubusercontent.com/Microsoft/BotFramework-WebChat/master/doc/abs-logo.png" alt="Azure Bot Services logo" width="240" />
  </a>
</p>

<p align="center">A highly-customizable web-based client for Azure Bot Services.</p>

<p align="center">
  <a href="https://badge.fury.io/js/botframework-webchat"><img alt="npm version" src="https://badge.fury.io/js/botframework-webchat.svg" /></a>
  <a href="https://travis-ci.org/Microsoft/BotFramework-WebChat"><img alt="Build Status" src="https://travis-ci.org/Microsoft/BotFramework-WebChat.svg?branch=master" /></a>
  <a href="https://coveralls.io/github/Microsoft/BotFramework-WebChat?branch=master"><img src="https://coveralls.io/repos/github/Microsoft/BotFramework-WebChat/badge.svg?branch=master" alt="Coverage Status" /></a>
</p>

# How to use

> For previous versions of Web Chat (v3), visit the [Web Chat v3 branch](https://github.com/Microsoft/BotFramework-WebChat/tree/v3).

First, create a bot using [Azure Bot Service](https://azure.microsoft.com/en-us/services/bot-service/).
Once the bot is created, you will need to [obtain the bot's Web Chat secret](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-channel-connect-webchat?view=azure-bot-service-3.0#step-1) in Azure Portal. Then use the secret to [generate a token](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0) and pass it to your Web Chat.

Here is how how you can add Web Chat control to your website:

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="webchat" role="main"></div>
    <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
    <script>
      window.WebChat.renderWebChat({
        directLine: window.WebChat.createDirectLine({ token: 'YOUR_DIRECT_LINE_TOKEN' }),
        userID: 'YOUR_USER_ID',
        username: 'Web Chat User',
        locale: 'en-US',
        botAvatarInitials: 'WC',
        userAvatarInitials: 'WW'
      }, document.getElementById('webchat'));
    </script>
  </body>
</html>
```
> `userID`, `username`, `locale`, `botAvatarInitials`, and `userAvatarInitials` are all optional parameters to pass into the `renderWebChat` method.

> If `userID` is not specified, it will default to a random user ID. Multiple users sharing the same user ID is not recommended; their user state will be shared.

![Screenshot of Web Chat](https://raw.githubusercontent.com/Microsoft/BotFramework-WebChat/master/doc/weatherquery.png.jpg)

## Integrate with JavaScript

Web Chat is designed to integrate with your existing web site using JavaScript or React. Integrating with JavaScript will give you moderate styling and customizability.

### Full bundle

You can use the full, typical webchat package that contains the most typically used features.

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="webchat" role="main"></div>
    <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
    <script>
      window.WebChat.renderWebChat({
        directLine: window.WebChat.createDirectLine({ token: 'YOUR_DIRECT_LINE_TOKEN' }),
        userID: 'YOUR_USER_ID'
      }, document.getElementById('webchat'));
    </script>
  </body>
</html>
```

See the working sample of the [full Web Chat bundle](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/01.a.getting-started-full-bundle).

### Minimal bundle

Instead of using the full, typical package of Web Chat, you can choose a lighter-weight sample with fewer features. This bundle does **not** contain:
- Adaptive Cards
- Cognitive Services
- Markdown-It

Since Adaptive Cards is not included in this bundle, rich cards that depend on Adaptive Cards will not render, e.g. hero cards, receipt cards, etc. A list of attachments that are not supported without Adaptive Cards can be found on the [`createAdaptiveCardMiddleware.js` file](https://github.com/Microsoft/BotFramework-WebChat/tree/master/packages/component/src/Middleware/Attachment/createAdaptiveCardMiddleware.js).

See a working sample of the [minimal Web Chat bundle](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/02.a.getting-started-minimal-bundle).

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="webchat" role="main"></div>
    <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat-minimal.js"></script>
    <script>
      window.WebChat.renderWebChat({
        directLine: window.WebChat.createDirectLine({ token: 'YOUR_DIRECT_LINE_TOKEN' }),
        userID: 'YOUR_USER_ID'
      }, document.getElementById('webchat'));
    </script>
  </body>
</html>
```

## Integrate with React

For full customizability, you can use React to recompose components of Web Chat.

To install the production build from NPM, run `npm install botframework-webchat`.

```jsx
import { DirectLine } from 'botframework-directlinejs';
import React from 'react';
import ReactWebChat from 'botframework-webchat';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.directLine = new DirectLine({ token: 'YOUR_DIRECT_LINE_TOKEN' });
  }

  render() {
    return (
      <ReactWebChat directLine={ this.directLine } userID="YOUR_USER_ID" />
      element
    );
  }
}
```

> You can also run `npm install botframework-webchat@master` to install a development build that is synced with Web Chat's GitHub `master` branch.

See a working sample of [Web Chat rendered via React](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/03.a.host-with-react/).

# Customize Web Chat UI

Web Chat is designed to be customizable without forking the source code. The table below outlines what kind of customizations you can achieve when you are importing Web Chat in different ways. This list is not exhaustive.

| | CDN bundle | React |
| - | - | - |
| Change colors | :heavy_check_mark: | :heavy_check_mark: |
| Change sizes | :heavy_check_mark: | :heavy_check_mark: |
| Update/replace CSS styles | :heavy_check_mark: | :heavy_check_mark: |
| Listen to events | :heavy_check_mark: | :heavy_check_mark: |
| Interact with hosting webpage | :heavy_check_mark: | :heavy_check_mark: |
| Custom render activities | | :heavy_check_mark: |
| Custom render attachments | | :heavy_check_mark: |
| Add new UI components | | :heavy_check_mark: |
| Recompose the whole UI | | :heavy_check_mark: |

See more about [customizing Web Chat](https://github.com/Microsoft/BotFramework-WebChat/blob/master/SAMPLES.md) to learn more on customization.

# Building the project

> If you need to build this project for customization purposes, we strongly advise you to refer to our [samples](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples). If you cannot find any samples that fulfill your customization needs and you don't know how to do that, please [send your dream to us](https://github.com/Microsoft/BotFramework-WebChat/issues/).
>
> Forking Web Chat to make your own customizations means you will lose access to our latest updates. Maintaining forks also introduces chores that are substantially more complicated than a version bump.

To build Web Chat, you will need to make sure both your Node.js and NPM is latest version (either LTS or current).

```sh
npm install
npm run bootstrap
npm run build
```

## Build tasks

There are 3 types of build tasks in the build process.

- `npm run build`: Build for development (instrumented code for code coverage)
   - Will bundle as `webchat-instrumented*.js`
- `npm run watch`: Build for development with watch mode loop
- `npm run prepublishOnly`: Build for production
   - Will bundle as `webchat*.js`

## Testing Web Chat for development purpose

We built a playground app for testing Web Chat so we can test certain Web Chat specific features.

```sh
cd packages/playground
npm start
```

Then browse to http://localhost:3000/, and click on one of the connection options on the upper right corner.

- Official MockBot: we hosted a live demo bot for testing Web Chat features
- Emulator Core: it will connect to http://localhost:5000/v3/directline for [emulated Direct Line service](https://github.com/Microsoft/BotFramework-Emulator/tree/master/packages/emulator/cli/)

You are also advised to test the CDN bundles by copying the test harness from our samples.

## Building CDN bundle in development mode

Currently, the standard build script does not build the CDN bundle (`webchat*.js`).

```sh
cd packages/bundle
npm run webpack-dev
```

> By default, this script will run in watch mode.

## Building CDN bundle in production mode

If you want to build a production CDN bundle with minification, you can follow these steps.

```sh
cd packages/bundle
npm run prepublishOnly
```

# Samples list

| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Sample&nbsp;Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| Description                                                                                                                                                                                  | Link                                                                                                                 |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| [`01.a.getting-started-full-bundle`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/01.a.getting-started-full-bundle)                                               | Introduces Web Chat embed from a CDN, and demonstrates a simple, full-featured Web Chat. This includes Adaptive Cards, Cognitive Services, and Markdown-It dependencies.                                                            | [Full Bundle Demo](https://microsoft.github.io/BotFramework-WebChat/01.a.getting-started-full-bundle)                |
| [`01.b.getting-started-es5-bundle`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/01.b.getting-started-es5-bundle)                                                 | Introduces full-featured Web Chat embed with backwards compatibility for ES5 browsers using Web Chat's ES5 ponyfill.                                                                                                                | [ES5 Bundle Demo](https://microsoft.github.io/BotFramework-WebChat/01.b.getting-started-es5-bundle)                  |
| [`01.c.getting-started-migration`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/01.c.getting-started-migration)                                                   | Demonstrates how to migrate from your Web Chat v3 bot to v4.                                                                                                                                                                        | [Migration Demo](https://microsoft.github.io/BotFramework-WebChat/01.c.getting-started-migration)                    |
| [`02.a.getting-started-minimal-bundle`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/02.a.getting-started-minimal-bundle)                                         | Introduces the minimized CDN with only basic dependencies. This does NOT include Adaptive Cards, Cognitive Services dependencies, or Markdown-It dependencies.                                                                      | [Minimal Bundle Demo](https://microsoft.github.io/BotFramework-WebChat/02.a.getting-started-minimal-bundle)          |
| [`02.b.getting-started-minimal-markdown`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/02.b.getting-started-minimal-markdown)                                     | Demonstrates how to add the CDN for Markdown-It dependency on top of the minimal bundle.                                                                                                                                            | [Minimal with Markdown Demo](https://microsoft.github.io/BotFramework-WebChat/02.b.getting-started-minimal-markdown) |
| [`03.a.host-with-react`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/03.a.host-with-react)                                                                       | Demonstrates how to create a React component that hosts the full-featured Web Chat.                                                                                                                                                 | [Host with React Demo](https://microsoft.github.io/BotFramework-WebChat/03.a.host-with-react)                        |
| [`03.b.host-with-Angular5`](https://github.com/Microsoft/BotFramework-WebChat/issues/1423)                                                                                                 | Demonstrates how to create an Angular component that hosts the full-featured Web Chat.                                                                                                                                              |                                                                                                                      |
| [`04.a.display-user-bot-initials-styling`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/04.a.display-user-bot-initials-styling)                                   | Demonstrates how to display initials for both Web Chat participants.                                                                                                                                                                | [Bot initials Demo](https://github.com/Microsoft/BotFramework-WebChat/blob/master/samples/04.a.display-user-bot-initials-styling/)|
| [`04.b.display-user-bot-images-styling`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/04.b.display-user-bot-images-styling)                                       | Demonstrates how to display images and initials for both Web Chat participants.                                                                                                                                                     | [User images Demo](https://microsoft.github.io/BotFramework-WebChat/04.b.display-user-bot-images-styling)            |
| [`05.a.branding-webchat-styling`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/05.a.branding-webchat-styling)                                                     | Introduces the ability to style Web Chat to match your brand. This method of custom styling will not break upon Web Chat updates.                                                                                                   | [Branding Web Chat Demo](https://microsoft.github.io/BotFramework-WebChat/05.a.branding-webchat-styling)             |
| [`05.b.idiosyncratic-manual-styling`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/05.b.idiosyncratic-manual-styling/)                                            | Demonstrates how to make manual style changes, and is a more complicated and time-consuming way to customize styling of Web Chat. Manual styles may be broken upon Web Chat updates.                                                | [Idiosyncratic Styling Demo](https://microsoft.github.io/BotFramework-WebChat/05.b.idiosyncratic-manual-styling)     |
| [`05.c.presentation-mode-styling`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/05.c.presentation-mode-styling)                                                   | Demonstrates how to set up Presentation Mode, which displays chat history but does not show the send box, and disables the interactivity of Adaptive Cards.                                                                         | [Presentation Mode Demo](https://microsoft.github.io/BotFramework-WebChat/05.c.presentation-mode-styling)            |
| [`05.d.hide-upload-button-styling`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/05.d.hide-upload-button-styling)                                                 | Demonstrates how to hide file upload button via styling.                                                                                                                                                                            | [Hide Upload Button Demo](https://microsoft.github.io/BotFramework-WebChat/05.d.hide-upload-button-styling)          |
| [`06.a.cognitive-services-bing-speech-js`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/06.a.cognitive-services-bing-speech-js)                                   | Introduces speech-to-text and text-to-speech ability using the (deprecated) Cognitive Services Bing Speech API and JavaScript.                                                                                                      | [Bing Speech with JS Demo](https://microsoft.github.io/BotFramework-WebChat/06.a.cognitive-services-bing-speech-js)  |
| [`06.b.cognitive-services-bing-speech-react`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/06.b.cognitive-services-bing-speech-react)                             | Introduces speech-to-text and text-to-speech ability using the (deprecated) Cognitive Services Bing Speech API and React.                                                                                                           | [Bing Speech with React Demo](https://microsoft.github.io/BotFramework-WebChat/06.b.cognitive-services-bing-speech-react)|
| [`06.c.cognitive-services-speech-services-js`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/06.c.cognitive-services-speech-services-js)                           | Introduces speech-to-text and text-to-speech ability using Cognitive Services Speech Services API.                                                                                                                                  | [Speech Services with JS Demo](https://microsoft.github.io/BotFramework-WebChat/6.c.cognitive-services-speech-services-js)|
| [`06.d.speech-web-browser`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/06.d.speech-web-browser)                                                                 | Demonstrates how to implement text-to-speech using Web Chat's browser-based Web Speech API. (link to W3C standard in the sample)                                                                                                    | [Web Speech API Demo](https://microsoft.github.io/BotFramework-WebChat/06.d.speech-web-browser)                      |
| [`06.e.cognitive-services-speech-services-with-lexical-result`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/06.e.cognitive-services-speech-services-with-lexical-result) | Demonstrates how to use lexical result from Cognitive Services Speech Services API.                                                                                                                                         | [Lexical Result Demo](https://microsoft.github.io/BotFramework-WebChat/06.e.cognitive-services-speech-services-with-lexical-result)|
| [`06.f.hybrid-speech`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/06.f.hybrid-speech)                                                                           | Demonstrates how to use both browser-based Web Speech API for speech-to-text, and Cognitive Services Speech Services API for text-to-speech.                                                                                        | [Hybrid Speech Demo](https://microsoft.github.io/BotFramework-WebChat/06.f.hybrid-speech)                            |
| [`07.a.customization-timestamp-grouping`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/07.a.customization-timestamp-grouping)                                     | Demonstrates how to customize timestamps by showing or hiding timestamps and changing the grouping of messages by time.                                                                                                             | [Timestamp Grouping Demo](https://microsoft.github.io/BotFramework-WebChat/07.a.customization-timestamp-grouping)    |
| [`07.b.customization-send-typing-indicator`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/07.b.customization-send-typing-indicator)                                 | Demonstrates how to send typing activity when the user start typing on the send box.                                                                                                                                                | [User Typing Indicator Demo](https://microsoft.github.io/BotFramework-WebChat/07.b.customization-send-typing-indicator)|
| [`08.customization-user-highlighting`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/08.customization-user-highlighting)                                           | Demonstrates how to customize the styling of activities based whether the message is from the user or the bot.                                                                                                                      | [User Highlighting Demo](https://microsoft.github.io/BotFramework-WebChat/08.customization-user-highlighting)        |
| [`09.customization-reaction-buttons`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/09.customization-reaction-buttons/)                                            | Introduces the ability to create custom components for Web Chat that are unique to your bot's needs. This tutorial demonstrates the ability to add reaction emoji such as :thumbsup: and :thumbsdown: to conversational activities. | [Reaction Buttons Demo](https://microsoft.github.io/BotFramework-WebChat/09.customization-reaction-buttons)          |
| [`10.a.customization-card-components`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/10.a.customization-card-components)                                           | Demonstrates how to create custom activity card attachments, in this case GitHub repository cards.                                                                                                                                  | [Card Components Demo](https://microsoft.github.io/BotFramework-WebChat/10.a.customization-card-components)          |
| [`10.b.customization-password-input`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/10.b.customization-password-input)                                             | Demonstrates how to create custom activity for password input.                                                                                                                                                                      | [Password Input Demo](https://microsoft.github.io/BotFramework-WebChat/10.b.customization-password-input)            |
| [`11.customization-redux-actions`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/11.customization-redux-actions)                                                   | Advanced tutorial: Demonstrates how to incorporate redux middleware into your Web Chat app by sending redux actions through the bot. This example demonstrates manual styling based on activities between bot and user.             | [Redux Actions Demo](https://microsoft.github.io/BotFramework-WebChat/11.customization-redux-actions)                |
| [`12.customization-minimizable-web-chat`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/12.customization-minimizable-web-chat)                                     | Advanced tutorial: Demonstrates how to add the Web Chat interface to your website as a minimizable show/hide chat box.                                                                                                              | [Minimizable Web Chat Demo](https://microsoft.github.io/BotFramework-WebChat/12.customization-minimizable-web-chat)  |
| [`13.customization-speech-ui`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/13.customization-speech-ui)                                                           | Advanced tutorial: Demonstrates how to fully customize key components of your bot, in this case speech, which entirely replaces the text-based transcript UI and instead shows a simple speech button with the bot's response.      | [Speech UI Demo](https://microsoft.github.io/BotFramework-WebChat/13.customization-speech-ui)                        |
| [`14.customization-piping-to-redux`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/14.customization-piping-to-redux)                                               | Advanced tutorial: Demonstrates how to pipe bot activities to your own Redux store and use your bot to control your page through bot activities and Redux.                                                                          | [Piping to Redux Demo](https://microsoft.github.io/BotFramework-WebChat/14.customization-piping-to-redux)            |
| [`15.a.backchannel-piggyback-on-outgoing-activities`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/15.a.backchannel-piggyback-on-outgoing-activities)             | Advanced tutorial: Demonstrates how to add custom data to every outgoing activities.                                                                                                                                                | [Backchannel Piggybacking Demo](https://microsoft.github.io/BotFramework-WebChat/15.a.backchannel-piggyback-on-outgoing-activities)|
| [`15.b.incoming-activity-event`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/15.b.incoming-activity-event)                                                       | Advanced tutorial: Demonstrates how to forward all incoming activities to a JavaScript event for further processing.                                                                                                                | [Incoming Activity Demo](https://microsoft.github.io/BotFramework-WebChat/15.b.incoming-activity-event)              |
| [`15.c.programmatic-post-activity`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/15.c.programmatic-post-activity)                                                 | Advanced tutorial: Demonstrates how to send a message programmatically.                                                                                                                                                             | [Programmatic Posting Demo](https://microsoft.github.io/BotFramework-WebChat/15.c.programmatic-post-activity)        |
| [`15.d.backchannel-send-welcome-event`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/15.d.backchannel-send-welcome-event)                                         | Advanced tutorial: Demonstrates how to send welcome event with client capabilities such as browser language.                                                                                                                        | [Welcome Event Demo](https://microsoft.github.io/BotFramework-WebChat/15.d.backchannel-send-welcome-event)           |
| [`16.customization-selectable-activity`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/16.customization-selectable-activity)                                       | Advanced tutorial: Demonstrates how to add custom click behavior to each activity.                                                                                                                                                  | [Selectable Activity Demo](https://microsoft.github.io/BotFramework-WebChat/16.customization-selectable-activity)    |
| [`17.chat-send-history`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/17.chat-send-history)                                                                       | Advanced tutorial: Demonstrates the ability to save user input and allow the user to step back through previous sent messages.                                                                                                      | [Chat Send History Demo](https://microsoft.github.io/BotFramework-WebChat/17.chat-send-history)                      |
| [`18.customization-open-url`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/18.customization-open-url)                                                             | Advanced tutorial: Demonstrates how to customize the open URL behavior.                                                                                                                                                             | [Customize Open URL Demo](https://microsoft.github.io/BotFramework-WebChat/18.customization-open-url)                |

# Contributions

Like us? [Star us](https://github.com/Microsoft/BotFramework-WebChat/stargazers).

Want to make it better? [File an issue](https://github.com/Microsoft/BotFramework-WebChat/issues).

Don't like something you see? [Submit a pull request](https://github.com/Microsoft/BotFramework-WebChat/pulls).
