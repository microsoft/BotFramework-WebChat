# Feedyou fork of Microsoft Bot Framework WebChat

Embeddable web chat control for the [Microsoft Bot Framework](http://www.botframework.com) using the [DirectLine](https://docs.botframework.com/en-us/restapi/directline3/) API. This repo is customized fork of [BotBuilder-WebChat](https://github.com/Microsoft/BotFramework-WebChat) by [Feedyou](https://feedyou.agency). This features were added in comparsion with `BotBuilder-WebChat`:
  * show typing indicator on startup until the first message is recieved
  * increase typing indicator timeout from 3 to 20 seconds
  * show `imBack` buttons only for the last activity
  * send backchannel event on startup which could be used instead of `conversationUpdate` event
  * ability to pass some `userData` to bot using backchannel mechanism's `channelData` prop
  * preset some default values in `<App>` component - for example generate `user.id` if not set
  * support custom button click trigger for restarting conversation (`startOverTrigger` prop)
  * make emoticons compatible using [Twemoji](https://github.com/twitter/twemoji) 
  * configurable style themes (currently only `theme.mainColor` prop)

## How to add Web Chat to your website

### What you will get from Feedyou
These are configuration values you will get from Feedyou during WebChat implemenation phase.

  * `DirectLine secret` is used for authentication
  * `Bot ID` is string in format `feedbot-*`
  * `Bot name` will be shown as author name of messages from bot

Please paste these values to places marked by `...` in examples.

### In your non-React website

Include `botchat.css` and `botchat-es5.js` (from our https://feedyou.blob.core.windows.net/webchat/latest CDN) in your website, choose ID of element where webchat should be placed and paste required values you got from Feedyou. 

```HTML
<!DOCTYPE html>
<html>
  <head>
    <link href="https://feedyou.blob.core.windows.net/webchat/latest/botchat.css" rel="stylesheet" />
  </head>
  <body>
    <div id="bot" />
    <script src="https://feedyou.blob.core.windows.net/webchat/latest/botchat-es5.js"></script>
    <script>
      // we want unique ID for every customer
      var makeid = function () {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 11; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
      };

      BotChat.App({
        directLine: { secret: '...' },                  
        user: { id: makeid(), name: 'User' },    // you can change user name by yourself
        bot: { id: 'feedbot-...', name: '...' },
        showUploadButton: false,
        resize: 'detect',    
        locale: 'cs',
      }, document.getElementById("bot"));
    </script>
  </body>
</html>
```

> We no longer package polyfills in `botchat.js`. If you are no on an older browser, you can use the smaller bundle `botchat.js`, which do not include polyfills for browsers which support up to ES5.

You can see expandable WebChat example including customized styling in [/samples/feedyou/expandable.html](https://github.com/wearefeedyou/feedbot-webchat/blob/master/samples/backchannel/index.html). Note that `BotChat` component is initialized only after chat window is expanded, so bot is not triggered for users who not open chat.

<!---
* `/samples/standalone` has a slightly more sophisticated version of this code, great for testing
* You can reference to latest release like this, [https://cdn.botframework.com/botframework-webchat/latest/botchat.js](https://cdn.botframework.com/botframework-webchat/latest/botchat.js). Make sure you use the same version for both `botchat.css` and `botchat.js`.
   * You can also reference to a previously published build, for example, [https://cdn.botframework.com/botframework-webchat/0.11.4/botchat.js](https://cdn.botframework.com/botframework-webchat/0.11.4/botchat.js).
   * Or if you want to try out latest fixes as on our GitHub `master` branch, you can use [https://cdn.botframework.com/botframework-webchat/0.13.1-master.ea2166a/botchat.js](https://cdn.botframework.com/botframework-webchat/0.13.1-master.ea2166a/botchat.js). For all version information, you can find it on [NPM](https://www.npmjs.com/package/botframework-webchat?activeTab=versions).
* Don't want to depend on a CDN? Download the files and serve them up from your own website.
* Want to run a custom build of Web Chat? Clone this repo, [alter it](#customizing-web-chat), [build it](#building-web-chat), and reference your built `botchat.css` and `botchat.js` files.
* Go to the next level with [Advanced Web Chat](#advanced-web-chat)
* Running Web Chat inline may not work for some web pages. Read on for a solution.
-->

### In your React website

The simplest approach is to clone this already customized fork, [build it](#building-web-chat), then reference your local build in your project's `package.json` as follows:

```javascript
dependencies: {
    ...
    'botframework-webchat': 'file:/path/to/your/repo'
    ...
}
```

Running `npm install` will copy your local repo to `node_modules`, and `import`/`require` references to `'botframework-webchat'` will resolve correctly.

Include the `Chat` component in your React app, e.g.:

```typescript
import { Chat } from 'botframework-webchat';

...

const YourApp = () => {
    <div>
        <YourComponent />
        <Chat directLine={{ secret: '...' }} user={{ id: '...', name: 'User' }} bot={{ id: 'feedbot-...', name: 'Bot name' }} />
        <YourOtherComponent />
    </div>
}

...
```

## Building Web Chat

1. Clone (or fork) this repo
2. `npm install`
3. `npm run build` (to build on every change `npm run watch`, to build production `npm run prepublish`)

This builds the following:

* `/built/*.js` compiled from the TypeScript sources in `/src/*.js` - `/built/BotChat.js` is the root
* `/built/*.d.ts` declarations for TypeScript users - `/built/BotChat.d.ts` is the root
* `/built/*.js.map` sourcemaps for easier debugging
* `/botchat.js` webpacked UMD file containing all dependencies (React, Redux, RxJS, etc.)
* `/botchat.css` base stylesheet
* `/botchat-es5.js` is the Webpack bundle (a.k.a. `botchat.js`) plus polyfills for ES5 browsers
* `/botchat-fullwindow.css` media query stylesheet for a full-window experience

## Customizing Web Chat

### Styling

In the `/src/scss/` folder you will find the source files for generating `/botchat.css`. Run `npm run build-css` to compile once you've made your changes. For basic branding, change `colors.scss` to match your color scheme. For advanced styling, change `botchat.scss`.

#### Card Sizes / Responsiveness

Web Chat strives to use responsive design when possible. As part of this, Web Chat cards come in 3 sizes: narrow (216px), normal (320px) and wide (416px). In a full-window chat, these sizes are invoked by a CSS media query in the `/botchat-fullwindow.css` style sheet. You may customize this style sheet for the media query breakpoints in your own application. Or, if your Web Chat implementation is not a full-window experience, you can manually invoke card sizes by adding the CSS classes `wc-narrow` and `wc-wide` to the HTML element containing your chat.

### Strings

You can alter or add localized strings in [/src/Strings.ts](src/Strings.ts):

* Add one or more locales (with associated localized strings) to `localizedStrings`
* Add logic to map the requested locale to the supported locale in `strings`
* Please help the community by submitting a [pull request](https://github.com/Microsoft/BotFramework-WebChat/pulls).

### Behaviors

Behavioral customization will require changing the TypeScript files in `/src`. A full description of the architecture of Web Chat is beyond the scope of this document, but here are a few starters:

### Architecture

* `Chat` is the top-level React component
* `App` creates a React application consists solely of `Chat`
* `Chat` largely follows the Redux architecture laid out in [this video series](https://egghead.io/lessons/javascript-redux-the-single-immutable-state-tree)
* To handle async side effects of Redux actions, `Chat` uses `Epic` from [redux-observable](https://redux-observable.js.org) - here's a [video introduction](https://www.youtube.com/watch?v=sF5-V-Szo0c)
* Underlying `redux-observable` (and also [DirectLineJS](https://github.com/microsoft/botframework-directlinejs)) is the `RxJS` library, which implements the Observable pattern for wrangling async. A minimal grasp of `RxJS` is key to understanding Web Chat's plumbing.

### The Backchannel

Web Chat can either create its own instance of DirectLine (as shown in `/samples/standalone`), or it can share one with the hosting page (as shown in `/samples/backchannel`). In the shared case, Web Chat and/or the page can send and/or receive activities. If they are type 'event', Web Chat will not display them. This is how the backchannel works.

NOTE: The provided backchannel sample requires a bot which can send and receive specific event activities. Follow the instructions [here](https://github.com/ryanvolum/backChannelBot) to deploy such a bot.

The backchannel sample provided in this project listens for events of name "changeBackground" and sends events of name "buttonClicked". This highlights the ability for a bot to communicate with the page that embeds Web Chat.

In the sample above, the web page creates a DirectLine object:

```typescript
var botConnection = new BotChat.DirectLine(...);
```

It shares this when creating the Web Chat instance:

```typescript
BotChat.App({
    botConnection: botConnection,
    user: user
    ...
}, document.getElementById("BotChatGoesHere"));
```

It notifies the bot upon the click of a button on the web page:

```typescript
const postButtonMessage = () => {
    botConnection
        .postActivity({ type: "event", value: "", from: { id: "me" }, name: "buttonClicked" })
        .subscribe(id => console.log("success"));
    }
```

Note the creation of an activity of type 'event' and how it is sent with `postActivity`. Also note that the name and value of the event can be anything defined by the developer. It is simply a contract between the web page and the bot.

The client JavaScript also listens for a specific event from the bot:

```typescript
botConnection.activity$
    .filter(activity => activity.type === "event" && activity.name === "changeBackground")
    .subscribe(activity => changeBackgroundColor(activity.value))
```

The bot, in this example, can request the page to change the background color via a specific event with `name: 'changeBackground'`. The web page can respond to this in any way it wants, including ignoring it. In this case it cooperates by changing the background color as passed in the `value` field of the event.

Essentially the backchannel allows client and server to exchange any data needed, from requesting the client's time zone to reading a GPS location or what the user is doing on a web page. The bot can even "guide" the user by automatically filling out parts of a form and so on. The backchannel closes the gap between client JavaScript and bots.

<!-- ## You can contribute to Web Chat!

* Add localized strings (see [above](#strings))
* Report any unreported [issues](https://github.com/Microsoft/BotFramework-WebChat/issues)
* Propose new [features](https://github.com/Microsoft/BotFramework-WebChat/issues)
* Fix an outstanding [issue](https://github.com/Microsoft/BotFramework-WebChat/issues) and submit a [pull request](https://github.com/Microsoft/BotFramework-WebChat/pulls) *(please only commit source code, non-generated files)*

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
-->

## Copyright & License

© 2016 Microsoft Corporation

[MIT License](/LICENSE)
