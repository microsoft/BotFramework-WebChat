# ![Bot Framework Web Chat](https://raw.githubusercontent.com/microsoft/BotFramework-WebChat/main/media/BotFrameworkWebChat_header.png)

### [Click here to find out what is new in Web Chat](https://github.com/microsoft/BotFramework-WebChat/blob/main/CHANGELOG.md)

# Bot Framework Web Chat

[![npm version](https://badge.fury.io/js/botframework-webchat.svg)](https://badge.fury.io/js/botframework-webchat)
[![Build Status](https://fuselabs.visualstudio.com/BotFramework-WebChat/_apis/build/status/BotFramework-WebChat-daily?branchName=main)](https://fuselabs.visualstudio.com/BotFramework-WebChat/_build/latest?definitionId=498&branchName=main)

This repository contains code for the Bot Framework Web Chat component. The Bot Framework Web Chat component is a highly-customizable web-based client for the Bot Framework V4 SDK. The Bot Framework SDK v4 enables developers to model conversation and build sophisticated bot applications.

This repo is part of the [Microsoft Bot Framework](https://github.com/microsoft/botframework) - a comprehensive framework for building enterprise-grade conversational AI experiences.

<hr />

# Version notes

> This section points out important version notes. For further information, please see the related links and check the [`CHANGELOG.md`](https://github.com/microsoft/BotFramework-WebChat/blob/main/CHANGELOG.md)

### 4.12.1 patch: New style property `adaptiveCardsParserMaxVersion`

Web Chat 4.12.1 patch includes a new style property allowing developers to choose the max Adaptive Cards schema version. See [PR #3778](https://github.com/microsoft/BotFramework-WebChat/pull/3778) for code changes.

To specify a different max version, you can adjust the style options, shown below:

```js
window.WebChat.renderWebChat(
   {
      directLine,
      store,
      styleOptions: {
         adaptiveCardsParserMaxVersion: '1.2'
      }
   },
   document.getElementById('webchat')
);
```

-  Web Chat will apply the maximum schema available according to the Adaptive Cards version (as of this patch, schema 1.3) by default.
-  An invalid version will revert to Web Chat's default.

## Visual focus changes to transcript in Web Chat 4.12.0

A new accessibility update has been added to Web Chat from PR [#3703](https://github.com/microsoft/BotFramework-WebChat/pull/3703). This change creates visual focus for the transcript (bold black border) and `aria-activedescendent` focused activity (black dashed border) by default. Where applicable, `transcriptVisualKeyboardIndicator...` values will also be applied to carousel (`CarouselFilmStrip.js`) children. This is done in order to match current default focus styling for Adaptive Cards, which may be a child of a carousel.

To modify these styles, you can change the following props via `styleOptions`:

```
  transcriptActivityVisualKeyboardIndicatorColor: DEFAULT_SUBTLE,
  transcriptActivityVisualKeyboardIndicatorStyle: 'dashed',
  transcriptActivityVisualKeyboardIndicatorWidth: 1,
  transcriptVisualKeyboardIndicatorColor: 'Black',
  transcriptVisualKeyboardIndicatorStyle: 'solid',
  transcriptVisualKeyboardIndicatorWidth: 2,
```

The above code shows the default values you will see in Web Chat.

## API refactor into new package in Web Chat 4.11.0

The Web Chat API has been refactored into a separate package. To learn more, check out the [API refactor summary](https://github.com/microsoft/BotFramework-WebChat/pull/3543).

## Direct Line Speech support in Web Chat 4.7.0

Starting from Web Chat 4.7.0, Direct Line Speech is supported, and it is the preferred way to provide an integrated speech functionality in Web Chat. We are working on [closing feature gaps](https://github.com/microsoft/BotFramework-WebChat/labels/Direct%20Line%20Speech) between Direct Line Speech and Web Speech API (includes Cognitive Services and browser-provided speech functionality).

## Upgrading to 4.6.0

Starting from Web Chat 4.6.0, Web Chat requires React 16.8.6 or up.

Although we recommend that you upgrade your host app at your earliest convenience, we understand that host app may need some time before its React dependencies are updated, especially in regards to huge applications.

If your app is not ready for React 16.8.6 yet, you can follow the [hybrid React sample](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/01.getting-started/g.hybrid-react-npm) to dual-host React in your app.

## Speech changes in Web Chat 4.5.0

There is a breaking change on behavior expectations regarding speech and input hint in Web Chat. Please refer to the section on [input hint behavior before 4.5.0](https://github.com/microsoft/BotFramework-WebChat/blob/main/docs/SPEECH.md#input-hint-behavior-before-4-5-0) for details.

## Migrating from Web Chat v3 to v4

[View migration docs](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/MIGRATION.md) to learn about migrating from Web Chat v3.

<hr />

# How to use

First, create a bot using [Azure Bot Service](https://azure.microsoft.com/en-us/services/bot-service/).
Once the bot is created, you will need to [obtain the bot's Web Chat secret](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-channel-connect-webchat?view=azure-bot-service-3.0#step-1) in Azure Portal. Then use the secret to [generate a token](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0) and pass it to your Web Chat.

## Connect a client app to bot

Web Chat provides UI on top of the Direct Line and Direct Line Speech Channels. There are two ways to connect to your bot through HTTP calls from the client: by sending the Bot secret or generating a token via the secret.

<!-- TODO: https://github.com/microsoft/BotFramework-WebChat/issues/2151 (ongoing) -->
<!-- Update the following paragraph and the API table (`directline`) with new documentation when updated docs are published  -->

We strongly recommend using the token API instead of providing the app with your secret. To learn more about why, see the [authentication documentation](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0) on the [token API](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-api-reference?view=azure-bot-service-4.0) and client security.

For further reading, please see the following links:

-  Using Web Chat with [Azure Bot Services authentication](https://blog.botframework.com/2018/09/01/using-webchat-with-azure-bot-services-authentication/)

-  [Enhanced Direct Line authentication features](https://blog.botframework.com/2018/09/25/enhanced-direct-line-authentication-features/)

## Integrate with JavaScript

Web Chat is designed to integrate with your existing website using JavaScript or React. Integrating with JavaScript will give you moderate styling and customizability options.

You can use the full, typical Web Chat package (called full-feature bundle) that contains the most typically used features.

Here is how how you can add Web Chat control to your website:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html>
  <head>
    <script
      crossorigin="anonymous"
      src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"
    ></script>
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
          locale: 'en-US'
        },
        document.getElementById('webchat')
      );
    </script>
  </body>
</html>
```
<!-- prettier-ignore-end -->

> `userID`, `username`, and `locale` are all optional parameters to pass into the `renderWebChat` method. To learn more about Web Chat props, look at the [Web Chat API Reference](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/API.md) documentation.

> Assigning `userID` as a static value is not recommended since this will cause all users to share state. Please see the [`API userID entry`](https://github.com/microsoft/BotFramework-WebChat/blob/main/docs/API.md#userID) for more information.

More information on localization can be found in the [Localization](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/LOCALIZATION.md) documentation.

![Screenshot of Web Chat](https://raw.githubusercontent.com/microsoft/BotFramework-WebChat/main/media/weatherquery.png.jpg)

See the working sample of the [full Web Chat bundle](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/01.getting-started/a.full-bundle).

## Integrate with React

For full customizability, you can use React to recompose components of Web Chat.

To install the production build from NPM, run `npm install botframework-webchat`.

<!-- prettier-ignore-start -->
```js
import React, { useMemo } from 'react';
import ReactWebChat, { createDirectLine } from 'botframework-webchat';

export default () => {
  const directLine = useMemo(() => createDirectLine({ token: 'YOUR_DIRECT_LINE_TOKEN' }), []);

  return <ReactWebChat directLine={directLine} userID="YOUR_USER_ID" />;
};
```
<!-- prettier-ignore-end -->

> You can also run `npm install botframework-webchat@main` to install a development build that is synced with Web Chat's GitHub `main` branch.

See the working sample of [Web Chat rendered via React](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/01.getting-started/e.host-with-react/).

### Experimental support for Redux DevTools

Web Chat internally use Redux for state management. [Redux DevTools](https://github.com/reduxjs/redux-devtools) is enabled in the NPM build as an opt-in feature.

This is for glancing into how Web Chat works. This is not an API explorer and is not an endorsement of using the Redux store to programmatically access the UI. The [hooks API](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/HOOKS.md) should be used instead.

To use Redux DevTools, use the `createStoreWithDevTools` function for creating a Redux DevTools-enabled store.

<!-- prettier-ignore-start -->
```diff
  import React, { useMemo } from 'react';
- import ReactWebChat, { createDirectLine, createStore } from 'botframework-webchat';
+ import ReactWebChat, { createDirectLine, createStoreWithDevTools } from 'botframework-webchat';

  export default () => {
    const directLine = useMemo(() => createDirectLine({ token: 'YOUR_DIRECT_LINE_TOKEN' }), []);
-   const store = useMemo(() => createStore(), []);
+   const store = useMemo(() => createStoreWithDevTools(), []);

    return <ReactWebChat directLine={directLine} store={store} userID="YOUR_USER_ID" />;
  };
```
<!-- prettier-ignore-end -->

There are some limitations when using the Redux DevTools:

-  The Redux store uses side-effects via [`redux-saga`](https://github.com/redux-saga/redux-saga). Time-traveling may break the UI.
-  Many UI states are stored in React context and state. They are not exposed in the Redux store.
-  Some time-sensitive UIs are based on real-time clock and not affected by time-traveling.
-  Dispatching actions are not officially supported. Please use [hooks API](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/HOOKS.md) instead.
-  Actions and reducers may move in and out of Redux store across versions. [Hooks API](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/HOOKS.md) is the official API for accessing the UI.

# Customizing the Web Chat UI

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

See more about [customizing Web Chat](https://github.com/microsoft/BotFramework-WebChat/blob/main/samples/README.md) to learn more on customization.

## Supported Activity Types on the Web Chat Client

Bot Framework has many activity types, but not all are supported in Web Chat. [View activity types docs](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/ACTIVITYTYPES.md) to learn more.

# Samples list

[View the complete list of Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples) for more ideas on customizing Web Chat.

# Further reading

## API Reference

View the [API documentation](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/API.md) for implementing Web Chat.

## Browser compatibility

Web Chat supports the latest 2 versions of modern browsers like Chrome, Microsoft Edge, and FireFox.
If you need Web Chat in Internet Explorer 11, please see the [ES5 bundle demo](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/c.es5-bundle).

Please note, however:

-  Web Chat does not support Internet Explorer older than version 11
-  Customization as shown in non-ES5 samples are not supported for Internet Explorer. Because IE11 is a non-modern browser, it does not support ES6, and many samples that use arrow functions and modern promises would need to be manually converted to ES5. If you are in need of heavy customization for your app, we strongly recommend developing your app for a modern browser like Google Chrome or Microsoft Edge.
-  Web Chat has no plan to support samples for IE11 (ES5).
   -  For customers who wish to manually rewrite our other samples to work in IE11, we recommend looking into converting code from ES6+ to ES5 using polyfills and transpilers like [`babel`](https://babeljs.io/docs/en/next/babel-standalone.html).

## Accessibility

View the [accessibility documentation](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/ACCESSIBILITY.md).

## Localization

View the [localization documentation](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/LOCALIZATION.md) for implementing in Web Chat.

## Notifications

View the [notification documentation](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/NOTIFICATION.md) for implementing in Web Chat.

## Telemetry

View the [telemetry documentation](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/TELEMETRY.md) for implementing in Web Chat.

## Technical Support Guide

View the [Technical Support Guide](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/TECHNICAL_SUPPORT_GUIDE.md) to get guidance and help on troubleshooting in the Web Chat repo for more information before filing a new issue.

## Speech

Web Chat supports a wide-range of speech engines for a natural chat experience with a bot. This section outlines the different engines that are supported:

-  [Direct Line Speech](#integrate-with-direct-line-speech)
-  [Cognitive Services Speech Services](#integrate-with-cognitive-services-speech-services)
-  [Browser-provided engine or other engines](#browser-provided-engine-or-other-engines)

### Integrate with Direct Line Speech

Direct Line Speech is the preferred way to add speech functionality in Web Chat. Please refer to the [Direct Line Speech](https://github.com/microsoft/BotFramework-WebChat/blob/main/docs/DIRECT_LINE_SPEECH.md) documentation for details.

### Integrate with Cognitive Services Speech Services

You can use Cognitive Services Speech Services to add speech functionality to Web Chat. Please refer to the [Cognitive Services Speech Services](https://github.com/microsoft/BotFramework-WebChat/blob/main/docs/SPEECH.md) documentation for details.

### Browser-provided engine or other engines

You can also use any speech engines which support [W3C Web Speech API standard](https://wicg.github.io/speech-api/). Some browsers support the [Speech Recognition API](https://caniuse.com/#feat=mdn-api_speechrecognition) and the [Speech Synthesis API](https://caniuse.com/#feat=mdn-api_speechsynthesis). You can mix-and-match different engines - including Cognitive Services Speech Services - to provide best user experience.

<hr />

# How to test with Web Chat's latest bits

Web Chat latest bits are available on the [Web Chat daily releases page](https://github.com/microsoft/BotFramework-WebChat/releases/daily).

Dailies will be released after 3:00AM Pacific Standard Time when changes have been committed to the main branch.

# Contributing

See our [Contributing page](https://github.com/microsoft/BotFramework-WebChat/tree/main/.github/CONTRIBUTING.md) for details on how to build the project and our repository guidelines for Pull Requests.

See our [CODE OF CONDUCT page](https://github.com/microsoft/BotFramework-WebChat/blob/main/.github/CODE_OF_CONDUCT.md) for details about the Microsoft Code of Conduct.

# Reporting Security Issues

[View the security documentation](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/SECURITY.md) to learn more about reporting security issues.
