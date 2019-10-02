# ![Bot Framework Web Chat](https://raw.githubusercontent.com/microsoft/BotFramework-WebChat/master/media/BotFrameworkWebChat_header.png)

### [Click here to find out what's new for //build2019!](https://github.com/microsoft/botframework/blob/master/whats-new.md#whats-new)

# Bot Framework Web Chat

[![npm version](https://badge.fury.io/js/botframework-webchat.svg)](https://badge.fury.io/js/botframework-webchat)
[![Build Status](https://fuselabs.visualstudio.com/BotFramework-WebChat/_apis/build/status/BotFramework-WebChat-daily?branchName=master)](https://fuselabs.visualstudio.com/BotFramework-WebChat/_build/latest?definitionId=498&branchName=master)
[![Coverage Status](https://coveralls.io/repos/github/microsoft/BotFramework-WebChat/badge.svg?branch=master)](https://coveralls.io/github/microsoft/BotFramework-WebChat?branch=master)

This repository contains code for the Bot Framework Web Chat component. The Bot Framework Web Chat component is a highly-customizable web-based client for the Bot Framework V4 SDK. The Bot Framework SDK v4 enables developers to model conversation and build sophisticated bot applications.

This repo is part of the [Microsoft Bot Framework](https://github.com/microsoft/botframework) - a comprehensive framework for building enterprise-grade conversational AI experiences.

## Migrating from Web Chat v3 to v4

There are three possible paths that migration might take when migrating from v3 to v4. First, please compare your beginning scenario:

### My current website integrates Web Chat using an `<iframe>` element obtained from Azure Bot Services. I want to upgrade to v4.

Starting from May 2019, we are rolling out v4 to websites that integrate Web Chat using `<iframe>` element. Please refer to [the embed documentation](https://github.com/microsoft/BotFramework-WebChat/tree/master/packages/embed) for information on integrating Web Chat using `<iframe>`.

### My website is integrated with Web Chat v3 and uses customization options provided by Web Chat, no customization at all, or very little of my own customization that was not available with Web Chat.

Please follow the implementation of sample [`01.c.getting-started-migration`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.c.getting-started-migration) to convert your webpage from v3 to v4 of Web Chat.

### My website is integrated with a fork of Web Chat v3. I have implemented a lot of customization in my version of Web Chat, and I am concerned v4 is not compatible with my needs.

One of our team's favorite things about v4 of Web Chat is the ability to add customization **without the need to fork Web Chat**. Although this creates additional overhead for v3 users who forked Web Chat previously, we will do our best to support customers making the bump. Please use the following suggestions:

-  Take a look at the implementation of sample [`01.c.getting-started-migration`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.c.getting-started-migration). This is a great starting place to get Web Chat up and running.
-  Next, please go through the [samples list](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples) to compare your customization requirements to what Web Chat has already provided support for. These samples are made up of commonly asked-for features for Web Chat.
-  If one or more of your features is not available in the samples, please look through our [open and closed issues](https://github.com/microsoft/BotFramework-WebChat/issues?utf8=%E2%9C%93&q=is%3Aissue+), [Samples label](https://github.com/microsoft/BotFramework-WebChat/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+label%3ASample), and the [Migration Support label](https://github.com/microsoft/BotFramework-WebChat/issues?q=is%3Aissue+migrate+label%3A%22Migration+Support%22) to search for sample requests and/or customization support for a feature you are looking for. Adding your comment to open issues will help the team prioritize requests that are in high demand, and we encourage participation in our community.
-  If you did not find your feature in the list of open requests, please feel free to [file your own request](https://github.com/microsoft/BotFramework-WebChat/issues/new). Just like the item above, other customers adding comments to your open issue will help us prioritize which features are most commonly needed across Web Chat users.
-  Finally, if you need your feature as soon as possible, we welcome [pull requests](https://github.com/microsoft/BotFramework-WebChat/compare) to Web Chat. If you have the coding experience to implement the feature yourself, we would very much appreciate the additional support! Creating the feature yourself will mean that it is available for your use on Web Chat more quickly, and that other customers looking for the same or similar feature may utilize your contribution.
-  Make sure to check out the rest of this `README` to learn more about v4.

# How to use

> For previous versions of Web Chat (v3), visit the [Web Chat v3 branch](https://github.com/microsoft/BotFramework-WebChat/tree/v3).

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
> ![Screenshot of Web Chat](https://raw.githubusercontent.com/microsoft/BotFramework-WebChat/master/media/weatherquery.png.jpg)

## Integrate with JavaScript

Web Chat is designed to integrate with your existing website using JavaScript or React. Integrating with JavaScript will give you moderate styling and customizability.

You can use the full, typical webchat package that contains the most typically used features.

```html
<!DOCTYPE html>
<html>
   <body>
      <div id="webchat" role="main"></div>
      <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
      <script>
         window.WebChat.renderWebChat(
            {
               directLine: window.WebChat.createDirectLine({
                  token: 'YOUR_DIRECT_LINE_TOKEN'
               }),
               userID: 'YOUR_USER_ID'
            },
            document.getElementById('webchat')
         );
      </script>
   </body>
</html>
```

See the working sample of the [full Web Chat bundle](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.a.getting-started-full-bundle).

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
      <ReactWebChat directLine={ this.directLine } userID='YOUR_USER_ID' />
      element
    );
  }
}
```

> You can also run `npm install botframework-webchat@master` to install a development build that is synced with Web Chat's GitHub `master` branch.

See a working sample of [Web Chat rendered via React](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/03.a.host-with-react/).

## Integrate with Cognitive Services Speech Services

You can use Cognitive Services Speech Services to add bi-directional speech functionality to Web Chat. Please refer to this article about [using Cognitive Services Speech Services](https://github.com/microsoft/BotFramework-WebChat/blob/master/SPEECH.md) for details.

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
Please refer to [`ACTIVITYTYPES.md`](https://github.com/microsoft/BotFramework-WebChat/blob/master/ACTIVITYTYPES.md) for list of Web Chat supported activity types.

## Speech changes in Web Chat 4.5

There is a breaking change on behavior expectations regarding speech and input hint in Web Chat. Please refer to this section on [input hint behavior before 4.5.0](https://github.com/microsoft/BotFramework-WebChat/blob/master/SPEECH.md#input-hint-behavior-before-4-5-0) for details.

# Samples list

| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Sample&nbsp;Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Description                                                                                                                                                                                                                         | Link                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`01.a.getting-started-full-bundle`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.a.getting-started-full-bundle)                                                                                       | Introduces Web Chat embed from a CDN, and demonstrates a simple, full-featured Web Chat. This includes Adaptive Cards, Cognitive Services, and Markdown-It dependencies.                                                            | [Full Bundle Demo](https://microsoft.github.io/BotFramework-WebChat/01.a.getting-started-full-bundle)                                                   |
| [`01.b.getting-started-es5-bundle`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.b.getting-started-es5-bundle)                                                                                         | Introduces full-featured Web Chat embed with backwards compatibility for ES5 browsers using Web Chat's ES5 ponyfill.                                                                                                                | [ES5 Bundle Demo](https://microsoft.github.io/BotFramework-WebChat/01.b.getting-started-es5-bundle)                                                     |
| [`01.c.getting-started-migration`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.c.getting-started-migration)                                                                                           | Demonstrates how to migrate from your Web Chat v3 bot to v4.                                                                                                                                                                        | [Migration Demo](https://microsoft.github.io/BotFramework-WebChat/01.c.getting-started-migration)                                                       |
| [`02.a.getting-started-minimal-bundle`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/02.a.getting-started-minimal-bundle)                                                                                 | Introduces the minimized CDN with only basic dependencies. This does NOT include Adaptive Cards, Cognitive Services dependencies, or Markdown-It dependencies.                                                                      | [Minimal Bundle Demo](https://microsoft.github.io/BotFramework-WebChat/02.a.getting-started-minimal-bundle)                                             |
| [`02.b.getting-started-minimal-markdown`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/02.b.getting-started-minimal-markdown)                                                                             | Demonstrates how to add the CDN for Markdown-It dependency on top of the minimal bundle.                                                                                                                                            | [Minimal with Markdown Demo](https://microsoft.github.io/BotFramework-WebChat/02.b.getting-started-minimal-markdown)                                    |
| [`03.a.host-with-react`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/03.a.host-with-react)                                                                                                               | Demonstrates how to create a React component that hosts the full-featured Web Chat.                                                                                                                                                 | [Host with React Demo](https://microsoft.github.io/BotFramework-WebChat/03.a.host-with-react)                                                           |
| [`03.b.host-with-Angular`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/03.b.host-with-angular)                                                                                                           | Demonstrates how to create an Angular component that hosts the full-featured Web Chat.                                                                                                                                              | [Host with Angular Demo](https://stackblitz.com/github/omarsourour/ng-webchat-example)                                                                  |
| [`04.a.display-user-bot-initials-styling`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/04.a.display-user-bot-initials-styling)                                                                           | Demonstrates how to display initials for both Web Chat participants.                                                                                                                                                                | [Bot initials Demo](https://github.com/microsoft/BotFramework-WebChat/blob/master/samples/04.a.display-user-bot-initials-styling/)                      |
| [`04.b.display-user-bot-images-styling`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/04.b.display-user-bot-images-styling)                                                                               | Demonstrates how to display images and initials for both Web Chat participants.                                                                                                                                                     | [User images Demo](https://microsoft.github.io/BotFramework-WebChat/04.b.display-user-bot-images-styling)                                               |
| [`05.a.branding-webchat-styling`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/05.a.branding-webchat-styling)                                                                                             | Introduces the ability to style Web Chat to match your brand. This method of custom styling will not break upon Web Chat updates.                                                                                                   | [Branding Web Chat Demo](https://microsoft.github.io/BotFramework-WebChat/05.a.branding-webchat-styling)                                                |
| [`05.b.idiosyncratic-manual-styling`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/05.b.idiosyncratic-manual-styling/)                                                                                    | Demonstrates how to make manual style changes, and is a more complicated and time-consuming way to customize styling of Web Chat. Manual styles may be broken upon Web Chat updates.                                                | [Idiosyncratic Styling Demo](https://microsoft.github.io/BotFramework-WebChat/05.b.idiosyncratic-manual-styling)                                        |
| [`05.c.presentation-mode-styling`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/05.c.presentation-mode-styling)                                                                                           | Demonstrates how to set up Presentation Mode, which displays chat history but does not show the send box, and disables the interactivity of Adaptive Cards.                                                                         | [Presentation Mode Demo](https://microsoft.github.io/BotFramework-WebChat/05.c.presentation-mode-styling)                                               |
| [`05.d.hide-upload-button-styling`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/05.d.hide-upload-button-styling)                                                                                         | Demonstrates how to hide file upload button via styling.                                                                                                                                                                            | [Hide Upload Button Demo](https://microsoft.github.io/BotFramework-WebChat/05.d.hide-upload-button-styling)                                             |
| [`06.a.cognitive-services-bing-speech-js`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/06.a.cognitive-services-bing-speech-js)                                                                           | Introduces speech-to-text and text-to-speech ability using the (deprecated) Cognitive Services Bing Speech API and JavaScript.                                                                                                      | [Bing Speech with JS Demo](https://microsoft.github.io/BotFramework-WebChat/06.a.cognitive-services-bing-speech-js)                                     |
| [`06.b.cognitive-services-bing-speech-react`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/06.b.cognitive-services-bing-speech-react)                                                                     | Introduces speech-to-text and text-to-speech ability using the (deprecated) Cognitive Services Bing Speech API and React.                                                                                                           | [Bing Speech with React Demo](https://microsoft.github.io/BotFramework-WebChat/06.b.cognitive-services-bing-speech-react)                               |
| [`06.c.cognitive-services-speech-services-js`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/06.c.cognitive-services-speech-services-js)                                                                   | Introduces speech-to-text and text-to-speech ability using Cognitive Services Speech Services API.                                                                                                                                  | [Speech Services with JS Demo](https://microsoft.github.io/BotFramework-WebChat/06.c.cognitive-services-speech-services-js)                             |
| [`06.d.speech-web-browser`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/06.d.speech-web-browser)                                                                                                         | Demonstrates how to implement text-to-speech using Web Chat's browser-based Web Speech API. (link to W3C standard in the sample)                                                                                                    | [Web Speech API Demo](https://microsoft.github.io/BotFramework-WebChat/06.d.speech-web-browser)                                                         |
| [`06.e.cognitive-services-speech-services-with-lexical-result`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/06.e.cognitive-services-speech-services-with-lexical-result)                                 | Demonstrates how to use lexical result from Cognitive Services Speech Services API.                                                                                                                                                 | [Lexical Result Demo](https://microsoft.github.io/BotFramework-WebChat/06.e.cognitive-services-speech-services-with-lexical-result)                     |
| [`06.f.hybrid-speech`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/06.f.hybrid-speech)                                                                                                                   | Demonstrates how to use both browser-based Web Speech API for speech-to-text, and Cognitive Services Speech Services API for text-to-speech.                                                                                        | [Hybrid Speech Demo](https://microsoft.github.io/BotFramework-WebChat/06.f.hybrid-speech)                                                               |
| [`06.g.select-voice`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/06.g.select-voice)                                                                                                                     | Demonstrates how to select speech synthesis voice based on activity.                                                                                                                                                                | [Select Voice Demo](https://microsoft.github.io/BotFramework-WebChat/06.g.select-voice)                                                                |
| [`07.a.customization-timestamp-grouping`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/07.a.customization-timestamp-grouping)                                                                             | Demonstrates how to customize timestamps by showing or hiding timestamps and changing the grouping of messages by time.                                                                                                             | [Timestamp Grouping Demo](https://microsoft.github.io/BotFramework-WebChat/07.a.customization-timestamp-grouping)                                       |
| [`07.b.customization-send-typing-indicator`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/07.b.customization-send-typing-indicator)                                                                       | Demonstrates how to send typing activity when the user start typing on the send box.                                                                                                                                                | [User Typing Indicator Demo](https://microsoft.github.io/BotFramework-WebChat/07.b.customization-send-typing-indicator)                                 |
| [`08.customization-user-highlighting`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/08.customization-user-highlighting)                                                                                   | Demonstrates how to customize the styling of activities based whether the message is from the user or the bot.                                                                                                                      | [User Highlighting Demo](https://microsoft.github.io/BotFramework-WebChat/08.customization-user-highlighting)                                           |
| [`09.customization-reaction-buttons`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/09.customization-reaction-buttons/)                                                                                    | Introduces the ability to create custom components for Web Chat that are unique to your bot's needs. This tutorial demonstrates the ability to add reaction emoji such as :thumbsup: and :thumbsdown: to conversational activities. | [Reaction Buttons Demo](https://microsoft.github.io/BotFramework-WebChat/09.customization-reaction-buttons)                                             |
| [`10.a.customization-card-components`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/10.a.customization-card-components)                                                                                   | Demonstrates how to create custom activity card attachments, in this case GitHub repository cards.                                                                                                                                  | [Card Components Demo](https://microsoft.github.io/BotFramework-WebChat/10.a.customization-card-components)                                             |
| [`10.b.customization-password-input`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/10.b.customization-password-input)                                                                                     | Demonstrates how to create custom activity for password input.                                                                                                                                                                      | [Password Input Demo](https://microsoft.github.io/BotFramework-WebChat/10.b.customization-password-input)                                               |
| [`11.customization-redux-actions`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/11.customization-redux-actions)                                                                                           | Advanced tutorial: Demonstrates how to incorporate redux middleware into your Web Chat app by sending redux actions through the bot. This example demonstrates manual styling based on activities between bot and user.             | [Redux Actions Demo](https://microsoft.github.io/BotFramework-WebChat/11.customization-redux-actions)                                                   |
| [`12.customization-minimizable-web-chat`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/12.customization-minimizable-web-chat)                                                                             | Advanced tutorial: Demonstrates how to add the Web Chat interface to your website as a minimizable show/hide chat box.                                                                                                              | [Minimizable Web Chat Demo](https://microsoft.github.io/BotFramework-WebChat/12.customization-minimizable-web-chat)                                     |
| [`13.customization-speech-ui`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/13.customization-speech-ui)                                                                                                   | Advanced tutorial: Demonstrates how to fully customize key components of your bot, in this case speech, which entirely replaces the text-based transcript UI and instead shows a simple speech button with the bot's response.      | [Speech UI Demo](https://microsoft.github.io/BotFramework-WebChat/13.customization-speech-ui)                                                           |
| [`14.customization-piping-to-redux`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/14.customization-piping-to-redux)                                                                                       | Advanced tutorial: Demonstrates how to pipe bot activities to your own Redux store and use your bot to control your page through bot activities and Redux.                                                                          | [Piping to Redux Demo](https://microsoft.github.io/BotFramework-WebChat/14.customization-piping-to-redux)                                               |
| [`15.a.backchannel-piggyback-on-outgoing-activities`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/15.a.backchannel-piggyback-on-outgoing-activities)                                                     | Advanced tutorial: Demonstrates how to add custom data to every outgoing activities.                                                                                                                                                | [Backchannel Piggybacking Demo](https://microsoft.github.io/BotFramework-WebChat/15.a.backchannel-piggyback-on-outgoing-activities)                     |
| [`15.b.incoming-activity-event`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/15.b.incoming-activity-event)                                                                                               | Advanced tutorial: Demonstrates how to forward all incoming activities to a JavaScript event for further processing.                                                                                                                | [Incoming Activity Demo](https://microsoft.github.io/BotFramework-WebChat/15.b.incoming-activity-event)                                                 |
| [`15.c.programmatic-post-activity`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/15.c.programmatic-post-activity)                                                                                         | Advanced tutorial: Demonstrates how to send a message programmatically.                                                                                                                                                             | [Programmatic Posting Demo](https://microsoft.github.io/BotFramework-WebChat/15.c.programmatic-post-activity)                                           |
| [`15.d.backchannel-send-welcome-event`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/15.d.backchannel-send-welcome-event)                                                                                 | Advanced tutorial: Demonstrates how to send welcome event with client capabilities such as browser language.                                                                                                                        | [Welcome Event Demo](https://microsoft.github.io/BotFramework-WebChat/15.d.backchannel-send-welcome-event)                                              |
| [`16.customization-selectable-activity`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/16.customization-selectable-activity)                                                                               | Advanced tutorial: Demonstrates how to add custom click behavior to each activity.                                                                                                                                                  | [Selectable Activity Demo](https://microsoft.github.io/BotFramework-WebChat/16.customization-selectable-activity)                                       |
| [`17.chat-send-history`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/17.chat-send-history)                                                                                                               | Advanced tutorial: Demonstrates the ability to save user input and allow the user to step back through previous sent messages.                                                                                                      | [Chat Send History Demo](https://microsoft.github.io/BotFramework-WebChat/17.chat-send-history)                                                         |
| [`18.customization-open-url`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/18.customization-open-url)                                                                                                     | Advanced tutorial: Demonstrates how to customize the open URL behavior.                                                                                                                                                             | [Customize Open URL Demo](https://microsoft.github.io/BotFramework-WebChat/18.customization-open-url)                                                   |
| [`19.a.single-sign-on-for-enterprise-apps`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/19.a.single-sign-on-for-enterprise-apps)                                                                         | Demonstrates how to use single sign-on for enterprise single-page applications using OAuth                                                                                                                                          | [Single Sign-On for Enterprise Single-Page Applications Demo](https://microsoft.github.io/BotFramework-WebChat/19.a.single-sign-on-for-enterprise-apps) |
| [`19.b.single-sign-on-for-intranet-apps`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/19.b.single-sign-on-for-intranet-apps)                                                                             | Demonstrates how to use single sign-on for Intranet apps using Azure Active Directory                                                                                                                                               | [Single Sign-On for Intranet Apps Demo](https://microsoft.github.io/BotFramework-WebChat/19.b.single-sign-on-for-intranet-apps)                         |
| [`19.c.single-sign-on-for-teams-apps`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/19.c.single-sign-on-for-teams-apps)                                                                                   | Demonstrates how to use single sign-on for Microsoft Teams apps using Azure Active Directory                                                                                                                                        | [Single Sign-On for Microsoft Teams Apps Demo](https://microsoft.github.io/BotFramework-WebChat/19.c.single-sign-on-for-teams-apps)                     |
| [`20.a.upload-to-azure-storage`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/20.a.upload-to-azure-storage)                                                                                               | Demonstrates how to use upload attachments directly to Azure Storage                                                                                                                                                                | [Upload to Azure Storage Demo](https://microsoft.github.io/BotFramework-WebChat/20.a.upload-to-azure-storage)                                           |
| [`21.customization-plain-ui`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/21.customization-plain-ui)                                                                                                     | Advanced tutorial: Demonstrates how to customize the Web Chat UI by building from ground up instead of needing to rewrite entire Web Chat components.                                                                               | [Plain UI Demo](https://microsoft.github.io/BotFramework-WebChat/21.customization-plain-ui)                                                             |

# Web Chat API Reference

There are several properties that you might pass into your Web Chat React Component (`<ReactWebChat>`) or the `renderWebChat()` method. Feel free to examine the source code starting with [`packages/component/src/Composer.js`](https://github.com/microsoft/BotFramework-WebChat/blob/master/packages/component/src/Composer.js#L378). Below is a short description of the available props.

| Property                   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activityMiddleware`       | A chain of middleware, modeled after [Redux middleware](https://medium.com/@jacobp100/you-arent-using-redux-middleware-enough-94ffe991e6), that allows the developer to add new DOM components on the currently existing DOM of Activities. The middleware signature is the following: `options => next => card => children => next(card)(children)`.                                                                                                                                                                                                                                           |
| `activityRenderer`         | The "flattened" version of `activityMiddleware`, similar to the [store enhancer](https://github.com/reduxjs/redux/blob/master/docs/Glossary.md#store-enhancer) concept in Redux.                                                                                                                                                                                                                                                                                                                                                                                                                |
| `adaptiveCardHostConfig`   | Pass in a custom Adaptive Cards host config. Be sure to verify your Host Config with the version of Adaptive Cards that is being used. See [Custom Host config](https://github.com/microsoft/BotFramework-WebChat/issues/2034#issuecomment-501818238) for more information.                                                                                                                                                                                                                                                                                                                     |
| `attachmentMiddleware`     | A chain of middleware that allows the developer to add their own custom HTML Elements on attachments. The signature is the following: `options => next => card => next(card)`.                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `attachmentRenderer`       | The "flattened" version of `attachmentMiddleware`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `cardActionMiddleware`     | A chain of middleware that allows the developer to modify card actions, like Adaptive Cards or suggested actions. The middleware signature is the following: `cardActionMiddleware: () => next => ({ cardAction, getSignInUrl }) => next(cardAction)`                                                                                                                                                                                                                                                                                                                                           |
| `createDirectLine`         | A factory method for instantiating the Direct Line object. Azure Government users should use `createDirectLine({ domain: 'https://directline.botframework.azure.us/v3/directline', token });` to change the endpoint. The full list of parameters are: `conversationId`, `domain`, `fetch`, `pollingInterval`, `secret`, `streamUrl`, `token`, `watermark` `webSocket`.                                                                                                                                                                                                                         |
| `createStore`              | A chain of middleware that allows the developer to modify the store actions. The middleware signature is the following: `createStore: ({}, ({ dispatch }) => next => action => next(cardAction)`                                                                                                                                                                                                                                                                                                                                                                                                |
| `directLine`               | Specify the DirectLine object with DirectLine token. We strongly recommend using the token API for authentication instead of providing the app with your secret. To learn more about why, see the [authentication documentation](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0) or [connecting client app to bot](#how-to-connect-client-app-to-bot)                                                         |
| `disabled`                 | Disable the UI (i.e. for presentation mode) of Web Chat.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `grammars`                 | Specify a grammar list for Speech (Bing Speech or Cognitive Services Speech Services).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `groupTimeStamp`           | Change default settings for timestamp groupings.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `locale`                   | Indicate the default language of Web Chat. Four letter codes (such as `en-US`) are strongly recommended.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `renderMarkdown`           | Change the default Markdown renderer object.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `sendTypingIndicator`      | Display a typing signal from the user to the bot to indicate that the user is not idling.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `store`                    | Specify a custom store, e.g. for adding programmatic activity to the bot.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `styleOptions`             | Object that stores customization values for your styling of Web Chat. For the complete list of (frequently updated) default style options, please see the [defaultStyleOptions.js](https://github.com/microsoft/BotFramework-WebChat/blob/master/packages/component/src/Styles/defaultStyleOptions.js) file.                                                                                                                                                                                                                                                                                    |
| `styleSet`                 | The non-recommended way of overriding styles.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `userID`                   | Specify a userID. There are two ways to specify the `userID`: in props, or in the token when generating the token call (`createDirectLine()`). If both methods are used to specify the userID, the token userID property will be used, and a `console.warn` will appear during runtime. If the `userID` is provided via props but is prefixed with `'dl'`, e.g. `'dl_1234'`, the value will be thrown and a new `ID` generated. If `userID` is not specified, it will default to a random user ID. Multiple users sharing the same user ID is not recommended; their user state will be shared. |
| `username`                 | Specify a username.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `webSpeechPonyFillFactory` | Specify the Web Speech object for text-to-speech and speech-to-text.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

# Browser compatibility

Web Chat supports the latest 2 versions of modern browsers like Chrome, Edge, and FireFox.
If you need Web Chat in Internet Explorer 11, please see the [ES5 bundle demo](https://microsoft.github.io/BotFramework-WebChat/01.b.getting-started-es5-bundle).

Please note, however:

-  Web Chat does not support Internet Explorer older than version 11
-  Customization as shown in non-ES5 samples are not supported for Internet Explorer. Because IE11 is a non-modern browser, it does not support ES6, and many samples that use arrow functions and modern promises would need to be manually converted to ES5. If you are in need of heavy customization for your app, we strongly recommend developing your app for a modern browser like Google Chrome or Edge.
-  Web Chat has no plan to support samples for IE11 (ES5).
   -  For customers who wish to manually rewrite our other samples to work in IE11, we recommend looking into converting code from ES6+ to ES5 using polyfills and transpilers like [`babel`](https://babeljs.io/docs/en/next/babel-standalone.html).


# How to connect client app to bot

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

Security issues and bugs should be reported privately, via email, to the Microsoft Security Response Center (MSRC) at [secure@microsoft.com](mailto:secure@microsoft.com). You should receive a response within 24 hours. If for some reason you do not, please follow up via email to ensure we received your original message. Further information, including the [MSRC PGP](https://technet.microsoft.com/en-us/security/dn606155) key, can be found in the [Security TechCenter](https://technet.microsoft.com/en-us/security/default).

Copyright (c) Microsoft Corporation. All rights reserved.
