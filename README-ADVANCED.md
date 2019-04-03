
## Advanced feedbot-webchat README

## Use webchat as component in your React app
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
