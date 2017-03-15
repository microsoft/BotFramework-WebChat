# Microsoft Bot Framework WebChat

Embeddable web chat control for the [Microsoft Bot Framework](http://www.botframework.com) using the [DirectLine](https://docs.botframework.com/en-us/restapi/directline3/) API.

Used by the Bot Framework developer portal, [Emulator](https://github.com/Microsoft/BotFramework-Emulator), WebChat channel, and [Azure Bot Service](https://azure.microsoft.com/en-us/services/bot-service/)

WebChat is available both as a [React](https://facebook.github.io/react/) component and as a self-contained control easily usable by any non-React website. Under the covers, WebChat is built with [TypeScript](http://www.typescriptlang.org) using [Redux](http://redux.js.org) for state management and [RxJS](http://reactivex.io/rxjs/) for wrangling async.

You can easily play with the most recent release using [botchattest](https://botchattest.herokuapp.com).

## How to add WebChat to your website

If you haven't already, start by [registering your bot](https://dev.botframework.com/bots/new).

Now decide how you'd like to use WebChat.

### Easiest: In any website, IFRAME the standard WebChat channel

Add a WebChat channel to your registered bot, and paste in the supplied `<iframe>` code, which points at a WebChat instance hosted by Microsoft. That was easy, you're done! Please be aware that the version of its WebChat instance may lag behind the latest release.

* Want more options, or to run the latest release, or a custom build? Read on.

### Easy: In your non-React website, run WebChat inline

Add a DirectLine (**not WebChat**) channel, and generate a Direct Line Secret. Make sure to enable Direct Line 3.0.

Include `botchat.css` and `botchat.js` in your website, e.g.:

```HTML
<!DOCTYPE html>
<html>
  <head>
    <link href="https://unpkg.com/botframework-webchat/botchat.css" rel="stylesheet" />
  </head>
  <body>
    <div id="bot"/>
    <script src="https://unpkg.com/botframework-webchat/botchat.js"></script>
    <script>
      BotChat.App({
        directLine: { secret: direct_line_secret },
        user: { id: 'userid' },
        bot: { id: 'botid' },
        resize: 'detect'
      }, document.getElementById("bot"));
    </script>
  </body>
</html>
```

* `/samples/standalone` has a slightly more sophisticated version of this code, great for testing
* You can reference a specific release like this: `https://unpkg.com/botframework-webchat/botchat.js@v0.8.3`. Make sure you version the `botchat.css` and `botchat.js` files together.
* Don't want to depend on a CDN? Download the files and serve them up from your own website.
* Want to run a custom build of WebChat? Clone this repo, [alter it](#customizing-webchat), [build it](#building-webchat), and reference your built `botchat.css` and `botchat.js` files.
* Go to the next level with [Advanced WebChat](#advanced-webchat)
* Running WebChat inline may not work for some web pages. Read on for a solution.

### Easyish: In any website, IFRAME your WebChat instance

You can isolate your instance of WebChat by running it inside an IFRAME. This involves creating two web pages:

1. Your WebChat instance, as shown above.
2. The hosting page, adding `<iframe src="/path/to/your/webchat/instance" height="height" width="width" />`

### Medium: In your React website, incorporate the WebChat React component

Add a DirectLine (**not WebChat**) channel, and generate a Direct Line Secret. Make sure to enable Direct Line 3.0.

Add WebChat to your React project via `npm install botframework-webchat`

Include the `Chat` component in your React app, e.g.:

```typescript
Import { Chat } from 'botframework-webchat';

...

const YourApp = () => {
    <div>
        <YourComponent />
        <Chat directLine={{ secret: direct_line_secret }} user={ 'userid' }/>
        <YourOtherComponent />
    </div>
}

...
```

* Go to the next level with [Advanced WebChat](#advanced-webchat)
* Want to run a custom build of WebChat in your React app? Read on.

### Hard: In your React website, incorporate a custom build of the WebChat component

The simplest approach is to clone (or fork) this repo, [alter it](#customizing-webchat), [build it](#building-webchat), then reference your local build in your project's `package.json` as follows:

```javascript
dependencies: {
    ...
    'botframework-webchat': 'file:/path/to/your/repo'
    ...
}
```

Running `npm install` will copy your local repo to `node_modules`, and `import`/`require` references to `'botframework-webchat'` will resolve correctly.

You may also wish to go so far as to publish your repo as its own full-fledged, versioned npm package using `npm version` and `npm publish`, either privately or publicly.

Different projects have different build strategies, yours may vary considerably from the above. If you come up with a different integration approach that you feel would have broad application, please consider filing a [pull request](https://github.com/Microsoft/BotFramework-WebChat/pulls) for this README.

## Building WebChat

1. Clone (or fork) this repo
2. `npm install`
3. `npm run build` (to build on every change `npm run watch`, to build production `npm run prepublish`)

This builds the following:

* `/built/*.js` compiled from the TypeScript sources in `/src/*.js` - `/built/BotChat.js` is the root
* `/built/*.d.ts` declarations for TypeScript users - `/built/BotChat.d.ts` is the root
* `/built/*.js.map` sourcemaps for easier debugging
* `/botchat.js` webpacked UMD file containing all dependencies (React, Redux, RxJS, polyfills, etc.)
* `/botchat.css` base stylesheet
* `/botchat-fullwindow.css` media query stylesheet for a full-window experience

## Customizing WebChat

### Styling

In the `/src/scss/` folder you will find the source files for generating `/botchat.css`. Run `npm run build-css` to compile once you've made your changes. For basic branding, change `colors.scss` to match your color scheme. For advanced styling, change `botchat.scss`.

#### Card Sizes / Responsiveness

WebChat strives to use responsive design when possible. As part of this, WebChat cards come in 3 sizes: narrow (216px), normal (320px) and wide (416px). In a full-window chat, these sizes are invoked by a CSS media query in the `/botchat-fullwindow.css` style sheet. You may customize this style sheet for the media query breakpoints in your own application. Or, if your WebChat implementation is not a full-window experience, you can manually invoke card sizes by adding the CSS classes `wc-narrow` and `wc-wide` to the HTML element containing your chat.

### Strings

You can alter or add localized strings in `/src/Strings.ts`:

* Add one or more locales (with associated localized strings) to `localizedStrings`
* Add logic to map the requested locale to the supported locale in `strings`
* Please help the community by submitting a [pull request](https://github.com/Microsoft/BotFramework-WebChat/pulls).

### Behaviors

Behavioral customization will require changing the TypeScript files in `/src`. A full description of the architecture of WebChat is beyond the scope of this document, but here are a few starters:

### Architecture

* `Chat` is the top-level React component
* `App` creates a React application consists solely of `Chat`
* `Chat` largely follows the Redux architecture layed out in [this video series](https://egghead.io/lessons/javascript-redux-the-single-immutable-state-tree)
* To handle async side effects of Redux actions, `Chat` uses `Epic` from [redux-observable](https://redux-observable.js.org) - here's a [video introduction](https://www.youtube.com/watch?v=sF5-V-Szo0c)
* Underlying `redux-observable` (and also [DirectLineJS](https://github.com/microsoft/botframework-directlinejs)) is the `RxJS` library, which implements the Observable pattern for wrangling async. A minimal grasp of `RxJS` is key to understanding WebChat's plumbing.

### Contributing

If you feel your change might benefit the community, please submit a [pull request](https://github.com/Microsoft/BotFramework-WebChat/pulls).

## Advanced WebChat

### Direct Line and DirectLineJS

WebChat communicates with your bot using the [Direct Line 3.0](https://docs.botframework.com/en-us/restapi/directline3/) protocol. WebChat's implementation of this protocol is called [DirectLineJS](https://github.com/microsoft/botframework-directlinejs) and can be installed and used independently of WebChat if you want to create your own user experience.

#### Direct Line fundamentals

WebChat exchanges *activities* with the bot. The most common activity type is 'message', but there is also 'typing', and 'event'. For more information on how to use 'event' activities, see [The Backchannel](#the-backchannel).

#### Named Direct Line endpoint

If you wish to point to a specific URL for Direct Line (such as a region-specific endpoint), pass it to DirectLine as `domain: direct_line_url`.

#### Secrets versus Tokens

If you don't want to publish your Direct Line Secret (which lets anyone put your bot on their website), exchange that Secret for a Token as detailed in the Direct Line [documentation](https://docs.botframework.com/en-us/restapi/directline3/) and pass it to DirectLine as `token: direct_line_token`. If you do choose to pass a Token instead of a Secret, you may need to handle scenarios where WebChat has become disconnected from the bot and needs a fresh token to reconnect. See the DirectLineJS [reconnect](https://github.com/microsoft/botframework-directlinejs#reconnect-to-a-conversation) documentation for a few more details on how to do this.

#### WebSocket

DirectLineJS defaults to WebSocket for receiving messages from the bot. If WebSocket is not available, it will use GET polling. You can force it to use GET polling by passing `webSocket: false` in the options you pass to DirectLine.

Note: the standard WebChat channel does not currently use WebSocket, which is a compelling reason to use this project.

### Typing

WebChat currently defaults to *not* sending 'typing' activities to the bot when the user is typing. If your bot would find it useful to receive these, pass `sendTyping: true` in the options to `App`/`Chat`. In the future this feature may be enabled by default, so set `sendTyping: false` if you want to make sure to disable it.

### User identity

You can supply WebChat with the id (and, optionally, a friendly name) of the current user by passing `user: { id: user_id, name: user_name }` to `App`/`Chat`. This object is passed with every activity sent from WebChat to the bot, which means it is not available to the bot *before* any activities are sent. See [The Backchannel](#the-backchannel) to find out how your web page can programatically send non-message activities to the bot.

### Replacing DirectLineJS

You can give WebChat any object that implements `IBotConnection` by passing `botConnection: your_directline_replacement` to `App`/`Chat`.

### The Backchannel

WebChat can either create its own instance of DirectLine (as shown in `/samples/standalone`), or it can share one with the hosting page (as shown in `/samples/backchannel`). In the shared case, WebChat and/or the page can send and/or receive activities. If they are type 'event', WebChat will not display them. This is how the backchannel works.

NOTE: The provided backchannel sample requires a bot which can send and receive specific event activities. Follow the instructions [here](https://github.com/ryanvolum/backChannelBot) to deploy such a bot. 

The backchannel sample provided in this project listens for events of name "changeBackground" and sends events of name "buttonClicked". This highlights the ability for a bot to communicate with the page that embeds WebChat. 

In the sample above, the web page creates a DirectLine object:

```typescript
var botConnection = new BotChat.DirectLine(...);
```

It shares this when creating the WebChat instance:

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

Essentially the backchannel allows client and server to exchange any data needed, from requesting the client's timezone to reading a GPS location or what the user is doing on a web page. The bot can even "guide" the user by automatically filling out parts of a form and so on. The backchannel closes the gap between client JavaScript and bots.

## You can contribute to WebChat!

* Add localized strings (see [above](#strings))
* Report any unreported [issues](https://github.com/Microsoft/BotFramework-WebChat/issues)
* Propose new [features](https://github.com/Microsoft/BotFramework-WebChat/issues)
* Fix an outstanding [issue](https://github.com/Microsoft/BotFramework-WebChat/issues) and submit a [pull request](https://github.com/Microsoft/BotFramework-WebChat/pulls) *(please only commit source code, non-generated files)*

## Copyright & License

© 2016 Microsoft Corporation

[MIT License](/LICENSE)
