# MSBotChat

React component implementing a chat interface for the [Microsoft Bot Framework](http://www.botframework.com) using the [DirectLine](https://docs.botframework.com/en-us/restapi/directline3) API.

Used by the Bot Framework WebChat channel, [Emulator](https://github.com/Microsoft/BotFramework-Emulator), and developer portal.

You can easily play with a recent build using [botchattest](https://botchattest.herokuapp.com)

## FAQ

### How can I use it?

* As an IFRAME in any website using the Bot Framework WebChat channel. In this case you don't need this repo or any of the information in it.
* As an IFRAME in any website, hosted by you, customized to your needs   
* As a component in your React webapp, customized to your needs

See more detailed instructions below.

### How do I customize it?

* Follow the below instructions to install and build
* Customize the visuals by altering the botchat.css file
* Or go farther and change the HTML/JSX and/or TypeScript 

### How do I contribute to it?

* File [issues](issues) and submit [pull requests](pulls)!

### Do you have a roadmap?

Not a formal one yet. Here are some notable upcoming features:

* WebSocket support for DirectLine 3.0
* Configurable logging
* Simple UI customization

Feel free to suggest features by filing an [issue](issues), if one doesn't already exist.

### How is it made?

MSBotChat is a [React](https://facebook.github.io/react/) component built in [TypeScript](http://www.typescriptlang.org) using [Redux](http://redux.js.org) for state management and [RxJS](http://reactivex.io/rxjs/) for wrangling async.

## Install, Build

1. Clone this repo
2. `npm install`
3. `npm run build` (to build on every change `npm run watch`, to build minified `npm run minify`)

## Obtain security credentials for your bot

1. If you haven't already, [register your bot](https://dev.botframework.com/bots/new).
2. Add a DirectLine channel, and generate a Direct Line Secret. Make sure to enable Direct Line 3.0.
3. For testing you can use your Direct Line Secret as a security token, but for production you will likely want to exchange that Secret for a Token as detailed in the Direct Line [documentation](https://docs.botframework.com/en-us/restapi/directline3).

## Decide how to run the botchat

### Directly in its own web page, for quick and easy testing

1. This method requires embedding your Direct Line Secret in the web page or querystring, and as such should mostly be used for local testing
2. Start a local web server using `npm run start` and aim your browser at `http://localhost:8000?s={Direct Line Secret}`. Or embed the Direct Line Secret directly in the JavaScript.

### Inline in your non-React website
 
1. Include [public/botchat.js](https://github.com/Microsoft/BotFramework-WebChat/blob/master/public/botchat.js) and you will get a React component called BotChat.Chat and a class called BotChat.DirectLine.
2. For some applications, you may instead prefer to access BotChat.App 
3. For TypeScript users there is a definition file called [public/botchat.d.ts](https://github.com/Microsoft/BotFramework-WebChat/blob/master/public/botchat.d.ts).
4. Pass in the appropriate properties, as listed in [public/botchat.d.ts](https://github.com/Microsoft/BotFramework-WebChat/blob/master/public/botchat.d.ts) and demonstrated in [public/index.html](https://github.com/Microsoft/BotFramework-WebChat/blob/master/public/index.html). 

### Embedded via IFRAME

1. Follow the above instructions to serve the botchat in its own web page
2. In your web server, pass the appropriate properties (listed in [public/botchat.d.ts](https://github.com/Microsoft/BotFramework-WebChat/blob/master/public/botchat.d.ts) to BotChat.App in index.html 
3. In your web server, exchange the Direct Line Secret for a Token as detailed in the Direct Line [documentation](https://docs.botframework.com/en-us/restapi/directline3).
4. In a second web page, embed the botchat via `<iframe src="http://{host}:{port}" width="320" height="500"/>`

(An example of this approach is [botchattest](https://github.com/billba/botchattest))

# Copyright & License

© 2016 Microsoft Corporation

[MIT License](/LICENSE)
