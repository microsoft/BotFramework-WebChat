# ![Bot Framework Web Chat](https://raw.githubusercontent.com/microsoft/BotFramework-WebChat/master/media/BotFrameworkWebChat_header.png)

### [Click here to find out what is new in Web Chat](https://github.com/microsoft/BotFramework-WebChat/blob/master/CHANGELOG.md)

# Bot Framework Web Chat

[![npm version](https://badge.fury.io/js/botframework-webchat.svg)](https://badge.fury.io/js/botframework-webchat)
[![Build Status](https://fuselabs.visualstudio.com/BotFramework-WebChat/_apis/build/status/BotFramework-WebChat-daily?branchName=master)](https://fuselabs.visualstudio.com/BotFramework-WebChat/_build/latest?definitionId=498&branchName=master)
[![Coverage Status](https://coveralls.io/repos/github/microsoft/BotFramework-WebChat/badge.svg?branch=master)](https://coveralls.io/github/microsoft/BotFramework-WebChat?branch=master)

This repository contains code for the Bot Framework Web Chat component. The Bot Framework Web Chat component is a highly-customizable web-based client for the Bot Framework V4 SDK. The Bot Framework SDK v4 enables developers to model conversation and build sophisticated bot applications.

This repo is part of the [Microsoft Bot Framework](https://github.com/microsoft/botframework) - a comprehensive framework for building enterprise-grade conversational AI experiences.

## Upgrading to 4.6.0

Starting from Web Chat 4.6.0, Web Chat requires React 16.8.6 or up.

Although we recommend that you upgrade your host app at your earliest convenience, we understand that host app may need some time before its React dependencies are updated, especially in regards to huge applications.

If your app is not ready for React 16.8.6 yet, you can follow [this sample](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/g.hybrid-react-npm) to dual-host React in your app.

## Speech changes in Web Chat 4.5.0

There is a breaking change on behavior expectations regarding speech and input hint in Web Chat. Please refer to this section on [input hint behavior before 4.5.0](https://github.com/microsoft/BotFramework-WebChat/blob/master/docs/SPEECH.md#input-hint-behavior-before-4-5-0) for details.

## Migrating from Web Chat v3 to v4

[View migration docs](https://github.com/microsoft/BotFramework-WebChat/tree/master/docs/MIGRATION.md) to learn about migrating from Web Chat v3

# How to use

> For previous versions of Web Chat (v3), visit the [Web Chat v3 branch](https://github.com/microsoft/BotFramework-WebChat/tree/v3).

First, create a bot using [Azure Bot Service](https://azure.microsoft.com/en-us/services/bot-service/).
Once the bot is created, you will need to [obtain the bot's Web Chat secret](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-channel-connect-webchat?view=azure-bot-service-3.0#step-1) in Azure Portal. Then use the secret to [generate a token](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0) and pass it to your Web Chat.

## Integrate with JavaScript

Web Chat is designed to integrate with your existing website using JavaScript or React. Integrating with JavaScript will give you moderate styling and customizability.

You can use the full, typical webchat package that contains the most typically used features.

Here is how how you can add Web Chat control to your website:

```html
<!DOCTYPE html>
<html>
   <head>
      <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
      <style>
         html,
         body {
            height: 100%;
         }

         body {
            margin: 0;
         }

         #webchat {
            height: 100%;
            width: 100%;
         }
      </style>
   </head>
   <body>
      <div id="webchat" role="main"></div>
      <script>
         window.WebChat.renderWebChat(
            {
               directLine: window.WebChat.createDirectLine({
                  token: 'YOUR_DIRECT_LINE_TOKEN'
               }),
               userID: 'YOUR_USER_ID',
               username: 'Web Chat User',
               locale: 'en-US',
               botAvatarInitials: 'WC',
               userAvatarInitials: 'WW'
            },
            document.getElementById('webchat')
         );
      </script>
   </body>
</html>
```

> `userID`, `username`, `locale`, `botAvatarInitials`, and `userAvatarInitials` are all optional parameters to pass into the `renderWebChat` method. To learn more about Web Chat props, look at the [Web Chat API Reference](#web-chat-api-reference) section of this `README`.

![Screenshot of Web Chat](https://raw.githubusercontent.com/microsoft/BotFramework-WebChat/master/media/weatherquery.png.jpg)

See the working sample of the [full Web Chat bundle](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/a.full-bundle).

## Integrate with React

For full customizability, you can use React to recompose components of Web Chat.

To install the production build from NPM, run `npm install botframework-webchat`.

```jsx
import React, { useMemo } from 'react';
import ReactWebChat, { createDirectLine } from 'botframework-webchat';

export default () => {
   const directLine = useMemo(() => createDirectLine({ token: 'YOUR_DIRECT_LINE_TOKEN' }), []);

   return <ReactWebChat directLine={directLine} userID="YOUR_USER_ID" />;
};
```

> You can also run `npm install botframework-webchat@master` to install a development build that is synced with Web Chat's GitHub `master` branch.

See the working sample of [Web Chat rendered via React](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/e.host-with-react/).

## Integrate with Cognitive Services Speech Services

You can use Cognitive Services Speech Services to add bi-directional speech functionality to Web Chat. Please refer to this article about [using Cognitive Services Speech Services](https://github.com/microsoft/BotFramework-WebChat/blob/master/docs/SPEECH.md) for details.

# Customize Web Chat UI

Web Chat is designed to be customizable without forking the source code. The table below outlines what kind of customizations you can achieve when you are importing Web Chat in different ways. This list is not exhaustive.

|                               | CDN bundle |  React   |
| ----------------------------- | :--------: | :------: |
| Change colors                 |  &#10004;  | &#10004; |
| Change sizes                  |  &#10004;  | &#10004; |
| Update/replace CSS styles     |  &#10004;  | &#10004; |
| Listen to events              |  &#10004;  | &#10004; |
| Interact with hosting webpage |  &#10004;  | &#10004; |
| Custom render activities      |            | &#10004; |
| Custom render attachments     |            | &#10004; |
| Add new UI components         |            | &#10004; |
| Recompose the whole UI        |            | &#10004; |

See more about [customizing Web Chat](https://github.com/microsoft/BotFramework-WebChat/blob/master/SAMPLES.md) to learn more on customization.

## Supported Activity Types on the Web Chat Client

[View activity types docs](https://github.com/microsoft/BotFramework-WebChat/tree/master/docs/ACTIVITYTYPES.md)

# Samples list

| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Sample&nbsp;Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Description                                                                                                                                                                                                                         | Link                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Migration**                                                                                                                                                                                                                      |                                                                                                                                                                                                                                     |                                                                                                                                                                |
| [`00.migration/a.v3-to-v4`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/00.migration/a.v3-to-v4)                                                                                                         | Demonstrates how to migrate from your Web Chat v3 bot to v4.                                                                                                                                                                        | [Migration Demo](https://microsoft.github.io/BotFramework-WebChat/00.migration/a.v3-to-v4)                                                                     |
| **Getting started**                                                                                                                                                                                                                |                                                                                                                                                                                                                                     |                                                                                                                                                                |
| [`01.getting-started/a.full-bundle`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/a.full-bundle)                                                                                       | Introduces Web Chat embed from a CDN, and demonstrates a simple, full-featured Web Chat. This includes Adaptive Cards, Cognitive Services, and Markdown-It dependencies.                                                            | [Full Bundle Demo](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/a.full-bundle)                                                          |
| [`01.getting-started/b.minimal-bundle`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/b.minimal-bundle)                                                                                 | Introduces the minimized CDN with only basic dependencies. This does NOT include Adaptive Cards, Cognitive Services dependencies, or Markdown-It dependencies.                                                                      | [Minimal Bundle Demo](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/b.minimal-bundle)                                                    |
| [`01.getting-started/c.es5-bundle`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/c.es5-bundle)                                                                                         | Introduces full-featured Web Chat embed with backwards compatibility for ES5 browsers using Web Chat's ES5 ponyfill.                                                                                                                | [ES5 Bundle Demo](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/c.es5-bundle)                                                            |
| [`01.getting-started/d.es5-direct-line-speech`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/d.es5-direct-line-speech)                                                                 | Demonstrates how to use Direct Line Speech with ES5 bundle.                                                                                                                                                                         | [ES5 Direct Line Speech Demo](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/d.es5-direct-line-speech)                                    |
| [`01.getting-started/e.host-with-react`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/e.host-with-react)                                                                               | Demonstrates how to create a React component that hosts the full-featured Web Chat.                                                                                                                                                 | [Host with React Demo](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/e.host-with-react)                                                  |
| [`01.getting-started/f.host-with-angular`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/f.host-with-angular)                                                                           | Demonstrates how to create an Angular component that hosts the full-featured Web Chat.                                                                                                                                              | [Host with Angular Demo](https://stackblitz.com/github/omarsourour/ng-webchat-example)                                                                         |
| [`01.getting-started/g.hybrid-react-npm`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/g.hybrid-react-npm)                                                                             | Demonstrates how to use different versions of React on a hosting app via NPM packages                                                                                                                                               | [Hybrid React Demo](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/g.hybrid-react-npm)                                                    |
| [`01.getting-started/h.minimal-markdown`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/h.minimal-markdown)                                                                             | Demonstrates how to add the CDN for Markdown-It dependency on top of the minimal bundle.                                                                                                                                            | [Minimal with Markdown Demo](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/h.minimal-markdown)                                           |
| **Branding, styling, and customization**                                                                                                                                                                                           |                                                                                                                                                                                                                                     |                                                                                                                                                                |
| [`02.branding-styling-and-customization/a.branding-web-chat`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/02.branding-styling-and-customization/a.branding-web-chat)                                     | Introduces the ability to style Web Chat to match your brand. This method of custom styling will not break upon Web Chat updates.                                                                                                   | [Branding Web Chat Demo](https://microsoft.github.io/BotFramework-WebChat/02.branding-styling-and-customization/a.branding-web-chat)                           |
| [`02.branding-styling-and-customization/b.idiosyncratic-manual-styles`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/02.branding-styling-and-customization/b.idiosyncratic-manual-styles)                 | Demonstrates how to make manual style changes, and is a more complicated and time-consuming way to customize styling of Web Chat. Manual styles may be broken upon Web Chat updates.                                                | [Idiosyncratic Styling Demo](https://microsoft.github.io/BotFramework-WebChat/02.branding-styling-and-customization/b.idiosyncratic-manual-styles)             |
| [`02.branding-styling-and-customization/c.display-sender-initials`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/02.branding-styling-and-customization/c.display-sender-initials)                         | Demonstrates how to display initials for both Web Chat participants.                                                                                                                                                                | [Bot initials Demo](https://microsoft.github.io/BotFramework-WebChat/02.branding-styling-and-customization/c.display-sender-initials/)                         |
| [`02.branding-styling-and-customization/d.display-sender-images`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/02.branding-styling-and-customization/d.display-sender-images)                             | Demonstrates how to display images and initials for both Web Chat participants.                                                                                                                                                     | [User images Demo](https://microsoft.github.io/BotFramework-WebChat/02.branding-styling-and-customization/d.display-sender-images)                             |
| [`02.branding-styling-and-customization/e.presentation-mode`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/02.branding-styling-and-customization/e.presentation-mode)                                     | Demonstrates how to set up Presentation Mode, which displays chat history but does not show the send box, and disables the interactivity of Adaptive Cards.                                                                         | [Presentation Mode Demo](https://microsoft.github.io/BotFramework-WebChat/02.branding-styling-and-customization/e.presentation-mode)                           |
| [`02.branding-styling-and-customization/f.hide-upload-button`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/02.branding-styling-and-customization/f.hide-upload-button)                                   | Demonstrates how to hide file upload button via styling.                                                                                                                                                                            | [Hide Upload Button Demo](https://microsoft.github.io/BotFramework-WebChat/02.branding-styling-and-customization/f.hide-upload-button)                         |
| [`02.branding-styling-and-customization/g.change-locale`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/02.branding-styling-and-customization/g.change-locale)                                             | Demonstrates how to change locale when an activity is received from the bot                                                                                                                                                         | [Change Locale Demo](https://microsoft.github.io/BotFramework-WebChat/02.branding-styling-and-customization/g.change-locale)                                   |
| **Speech**                                                                                                                                                                                                                         |                                                                                                                                                                                                                                     |                                                                                                                                                                |
| [`03.speech/a.direct-line-speech`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/03.speech/a.direct-line-speech)                                                                                           | Demonstrates how to use Direct Line Speech channel in Web Chat.                                                                                                                                                                     | [Direct Line Speech Demo](https://microsoft.github.io/BotFramework-WebChat/03.speech/a.direct-line-speech)                                                     |
| [`03.speech/b.cognitive-speech-services-js`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/03.speech/b.cognitive-speech-services-js)                                                                       | Introduces speech-to-text and text-to-speech ability using Cognitive Services Speech Services API.                                                                                                                                  | [Speech Services with JS Demo](https://microsoft.github.io/BotFramework-WebChat/03.speech/b.cognitive-speech-services-js)                                      |
| [`03.speech/c.cognitive-speech-services-with-lexical-result`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/03.speech/c.cognitive-speech-services-with-lexical-result)                                     | Demonstrates how to use lexical result from Cognitive Services Speech Services API.                                                                                                                                                 | [Lexical Result Demo](https://microsoft.github.io/BotFramework-WebChat/03.speech/c.cognitive-speech-services-with-lexical-result)                              |
| [`03.speech/d.cognitive-services-speech-recognition-only`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/03.speech/d.cognitive-services-speech-recognition-only)                                           | Implement Cognitive Speech Services with only Speech Recognition                                                                                                                                                                    | [Cognitive Speech: Speech Recognition](https://microsoft.github.io/BotFramework-WebChat/03.speech/d.cognitive-services-speech-recognition-only)                |
| [`03.speech/e.select-voice`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/03.speech/e.select-voice)                                                                                                       | Demonstrates how to select speech synthesis voice based on activity.                                                                                                                                                                | [Select Voice Demo](https://microsoft.github.io/BotFramework-WebChat/03.speech/e.select-voice)                                                                 |
| [`03.speech/f.web-browser-speech`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/03.speech/f.web-browser-speech)                                                                                           | Demonstrates how to implement text-to-speech using Web Chat's browser-based Web Speech API. (link to W3C standard in the sample)                                                                                                    | [Web Speech API Demo](https://microsoft.github.io/BotFramework-WebChat/03.speech/f.web-browser-speech)                                                         |
| [`03.speech/g.hybrid-speech`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/03.speech/g.hybrid-speech)                                                                                                     | Demonstrates how to use both browser-based Web Speech API for speech-to-text, and Cognitive Services Speech Services API for text-to-speech.                                                                                        | [Hybrid Speech Demo](https://microsoft.github.io/BotFramework-WebChat/03.speech/g.hybrid-speech)                                                               |
| **API**                                                                                                                                                                                                                            |                                                                                                                                                                                                                                     |                                                                                                                                                                |
| [`04.api/a.welcome-event`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/04.api/a.welcome-event)                                                                                                           | Advanced tutorial: Demonstrates how to send welcome event with client capabilities such as browser language.                                                                                                                        | [Welcome Event Demo](https://microsoft.github.io/BotFramework-WebChat/04.api/a.welcome-event)                                                                  |
| [`04.api/b.piggyback-on-outgoing-activities`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/04.api/b.piggyback-on-outgoing-activities)                                                                     | Advanced tutorial: Demonstrates how to add custom data to every outgoing activities.                                                                                                                                                | [Backchannel Piggybacking Demo](https://microsoft.github.io/BotFramework-WebChat/04.api/b.piggyback-on-outgoing-activities)                                    |
| [`04.api/c.incoming-activity-event`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/04.api/c.incoming-activity-event)                                                                                       | Advanced tutorial: Demonstrates how to forward all incoming activities to a JavaScript event for further processing.                                                                                                                | [Incoming Activity Demo](https://microsoft.github.io/BotFramework-WebChat/04.api/c.incoming-activity-event)                                                    |
| [`04.api/d.post-activity-event`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/04.api/d.post-activity-event)                                                                                               | Advanced tutorial: Demonstrates how to send a message programmatically.                                                                                                                                                             | [Programmatic Posting Demo](https://microsoft.github.io/BotFramework-WebChat/04.api/d.post-activity-event)                                                     |
| [`04.api/e.piping-to-redux`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/04.api/e.piping-to-redux)                                                                                                       | Advanced tutorial: Demonstrates how to pipe bot activities to your own Redux store and use your bot to control your page through bot activities and Redux.                                                                          | [Piping to Redux Demo](https://microsoft.github.io/BotFramework-WebChat/04.api/e.piping-to-redux)                                                              |
| [`04.api/f.selectable-activity`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/04.api/f.selectable-activity)                                                                                               | Advanced tutorial: Demonstrates how to add custom click behavior to each activity.                                                                                                                                                  | [Selectable Activity Demo](https://microsoft.github.io/BotFramework-WebChat/04.api/f.selectable-activity)                                                      |
| [`04.api/g.chat-send-history`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/04.api/g.chat-send-history)                                                                                                   | Advanced tutorial: Demonstrates the ability to save user input and allow the user to step back through previous sent messages.                                                                                                      | [Chat Send History Demo](https://microsoft.github.io/BotFramework-WebChat/04.api/g.chat-send-history)                                                          |
| [`04.api/h.clear-after-idle`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/04.api/h.clear-after-idle)                                                                                                     | Advanced tutorial: Demonstrates how to customize the open URL behavior.                                                                                                                                                             | [Clear After Idle Demo](https://microsoft.github.io/BotFramework-WebChat/04.api/h.clear-after-idle)                                                            |
| [`04.api/i.open-url`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/04.api/i.open-url)                                                                                                                     | Advanced tutorial: Demonstrates how to customize the open URL behavior.                                                                                                                                                             | [Customize Open URL Demo](https://microsoft.github.io/BotFramework-WebChat/04.api/i.open-url)                                                                  |
| [`04.api/j.redux-actions`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/04.api/j.redux-actions)                                                                                                           | Advanced tutorial: Demonstrates how to incorporate redux middleware into your Web Chat app by sending redux actions through the bot. This example demonstrates manual styling based on activities between bot and user.             | [Redux Actions Demo](https://microsoft.github.io/BotFramework-WebChat/04.api/j.redux-actions)                                                                  |
| **Custom components**                                                                                                                                                                                                              |                                                                                                                                                                                                                                     |                                                                                                                                                                |
| [`05.custom-components/a.timestamp-grouping`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/05.custom-components/a.timestamp-grouping)                                                                     | Demonstrates how to customize timestamps by showing or hiding timestamps and changing the grouping of messages by time.                                                                                                             | [Timestamp Grouping Demo](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/a.timestamp-grouping)                                          |
| [`05.custom-components/b.send-typing-indicator`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/05.custom-components/b.send-typing-indicator)                                                               | Demonstrates how to send typing activity when the user start typing on the send box.                                                                                                                                                | [User Typing Indicator Demo](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/b.send-typing-indicator)                                    |
| [`05.custom-components/c.user-highlighting`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/05.custom-components/c.user-highlighting)                                                                       | Demonstrates how to customize the styling of activities based whether the message is from the user or the bot.                                                                                                                      | [User Highlighting Demo](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/c.user-highlighting)                                            |
| [`05.custom-components/d.reaction-buttons`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/05.custom-components/d.reaction-buttons/)                                                                        | Introduces the ability to create custom components for Web Chat that are unique to your bot's needs. This tutorial demonstrates the ability to add reaction emoji such as :thumbsup: and :thumbsdown: to conversational activities. | [Reaction Buttons Demo](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/d.reaction-buttons)                                              |
| [`05.custom-components/e.card-components`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/05.custom-components/e.card-components)                                                                           | Demonstrates how to create custom activity card attachments, in this case GitHub repository cards.                                                                                                                                  | [Card Components Demo](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/e.card-components)                                                |
| [`05.custom-components/f.password-input`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/05.custom-components/f.password-input)                                                                             | Demonstrates how to create custom activity for password input.                                                                                                                                                                      | [Password Input Demo](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/f.password-input)                                                  |
| **Recomposing UI**                                                                                                                                                                                                                 |                                                                                                                                                                                                                                     |                                                                                                                                                                |
| [`06.recomposing-ui/a.minimizable-web-chat`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/06.recomposing-ui/a.minimizable-web-chat)                                                                       | Advanced tutorial: Demonstrates how to add the Web Chat interface to your website as a minimizable show/hide chat box.                                                                                                              | [Minimizable Web Chat Demo](https://microsoft.github.io/BotFramework-WebChat/06.recomposing-ui/a.minimizable-web-chat)                                         |
| [`06.recomposing-ui/b.speech-ui`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/06.recomposing-ui/b.speech-ui)                                                                                             | Advanced tutorial: Demonstrates how to fully customize key components of your bot, in this case speech, which entirely replaces the text-based transcript UI and instead shows a simple speech button with the bot's response.      | [Speech UI Demo](https://microsoft.github.io/BotFramework-WebChat/06.recomposing-ui/b.speech-ui)                                                               |
| [`06.recomposing-ui/c.smart-display`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/06.recomposing-ui/c.smart-display)                                                                                     | Demonstrates how to compose Web Chat UI into a Smart Display                                                                                                                                                                        | [Smart Display Demo](https://microsoft.github.io/BotFramework-WebChat/06.recomposing-ui/c.smart-display)                                                       |
| [`06.recomposing-ui/d.plain-ui`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/06.recomposing-ui/d.plain-ui)                                                                                               | Advanced tutorial: Demonstrates how to customize the Web Chat UI by building from ground up instead of needing to rewrite entire Web Chat components.                                                                               | [Plain UI Demo](https://microsoft.github.io/BotFramework-WebChat/06.recomposing-ui/d.plain-ui)                                                                 |
| **Advanced Web Chat apps**                                                                                                                                                                                                         |                                                                                                                                                                                                                                     |                                                                                                                                                                |
| [`07.advanced-web-chat-apps/a.upload-to-azure-storage`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/07.advanced-web-chat-apps/a.upload-to-azure-storage)                                                 | Demonstrates how to use upload attachments directly to Azure Storage                                                                                                                                                                | [Upload to Azure Storage Demo](https://microsoft.github.io/BotFramework-WebChat/07.advanced-web-chat-apps/a.upload-to-azure-storage)                           |
| [`07.advanced-web-chat-apps/b.sso-for-enterprise`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/07.advanced-web-chat-apps/b.sso-for-enterprise)                                                           | Demonstrates how to use single sign-on for enterprise single-page applications using OAuth                                                                                                                                          | [Single Sign-On for Enterprise Single-Page Applications Demo](https://microsoft.github.io/BotFramework-WebChat/07.advanced-web-chat-apps/b.sso-for-enterprise) |
| [`07.advanced-web-chat-apps/c.sso-for-intranet`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/07.advanced-web-chat-apps/c.sso-for-intranet)                                                               | Demonstrates how to use single sign-on for Intranet apps using Azure Active Directory                                                                                                                                               | [Single Sign-On for Intranet Apps Demo](https://microsoft.github.io/BotFramework-WebChat/07.advanced-web-chat-apps/c.sso-for-intranet)                         |
| [`07.advanced-web-chat-apps/d.sso-for-teams`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/07.advanced-web-chat-apps/d.sso-for-teams)                                                                     | Demonstrates how to use single sign-on for Microsoft Teams apps using Azure Active Directory                                                                                                                                        | [Single Sign-On for Microsoft Teams Apps Demo](https://microsoft.github.io/BotFramework-WebChat/07.advanced-web-chat-apps/d.sso-for-teams)                     |

# Web Chat API Reference

[View the API documentation](https://github.com/microsoft/BotFramework-WebChat/tree/master/docs/API.md)

# Browser compatibility

Web Chat supports the latest 2 versions of modern browsers like Chrome, Edge, and FireFox.
If you need Web Chat in Internet Explorer 11, please see the [ES5 bundle demo](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/c.es5-bundle).

Please note, however:

-  Web Chat does not support Internet Explorer older than version 11
-  Customization as shown in non-ES5 samples are not supported for Internet Explorer. Because IE11 is a non-modern browser, it does not support ES6, and many samples that use arrow functions and modern promises would need to be manually converted to ES5. If you are in need of heavy customization for your app, we strongly recommend developing your app for a modern browser like Google Chrome or Edge.
-  Web Chat has no plan to support samples for IE11 (ES5).
   -  For customers who wish to manually rewrite our other samples to work in IE11, we recommend looking into converting code from ES6+ to ES5 using polyfills and transpilers like [`babel`](https://babeljs.io/docs/en/next/babel-standalone.html).

# How to connect a client app to bot

Web Chat provides UI on top of the Direct Line Channel. There are two ways to connect to your bot through HTTP calls from the client: by sending the Bot secret or generating a token via the secret.

<!-- TODO: https://github.com/microsoft/BotFramework-WebChat/issues/2151 -->
<!-- Update the following paragraph and the API table (`directline`) with new documentation when updated docs are published  -->

We strongly recommend using the token API instead of providing the app with your secret. To learn more about why, see the [authentication documentation](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0) on the [token API](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-api-reference?view=azure-bot-service-4.0) and client security.

For further reading, please see the following links:

-  [Using Web Chat with Azure Bot Services authentication](https://blog.botframework.com/2018/09/01/using-webchat-with-azure-bot-services-authentication/)

-  [Enhanced Direct Line authentication features](https://blog.botframework.com/2018/09/25/enhanced-direct-line-authentication-features/)

# How to test with Web Chat's latest bits

_Testing unreleased features is only available via MyGet packaging at this time._

If you want to test a feature or bug fix that has not yet been released, you will want to point your Web Chat package to Web Chat's daily feed, as opposed the official npmjs feed.

Currently, you may access Web Chat's dailies by subscribing to our MyGet feed. To do this, you will need to update the registry in your project. **This change is reversible, and our directions include how to revert back to subscribing to the official release**.

## Subscribe to latest bits on `myget.org`

To do this you may add your packages and then change the registry of your project.

1. Add your project dependencies other than Web Chat.
1. In your project's root directory, create a `.npmrc` file
1. Add the following line to your file: `registry=https://botbuilder.myget.org/F/botframework-webchat/npm/`
1. Add Web Chat to your project dependencies `npm i botframework-webchat --save`
1. Note that in your `package-lock.json`, the registries pointed to are now MyGet. The Web Chat project has upstream source proxy enabled, which will redirect non-MyGet packages to `npmjs.com`.

## Re-subscribe to official release on `npmjs.com`

Re-subscribing requires that you reset your registry.

1. Delete your `.npmrc file`
1. Delete your root `package-lock.json`
1. Remove your `node_modules` directory
1. Reinstall your packages with `npm i`
1. Note that in your `package-lock.json`, the registries are pointing to https://npmjs.com/ again.

# Contributing

See our [Contributing page](https://github.com/microsoft/BotFramework-WebChat/tree/master/.github/CONTRIBUTING.md) for details on how to build the project and our repository guidelines for Pull Requests.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

# Reporting Security Issues

[View the security documentation](https://github.com/microsoft/BotFramework-WebChat/tree/master/docs/SECURITY.md) to learn more about reporting security issues.
