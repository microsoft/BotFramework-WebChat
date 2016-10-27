# MSBotChat

Sample chat app for the [Microsoft Bot Framework](http://www.botframework.com) using the [DirectLine](http://docs.botframework.com/sdkreference/restapi-directline/) API.

You can easily play with a recent build using [botchattest](https://botchattest.herokuapp.com)

## How real is this?

Rapidly-evolving proof of concept. Not currently supported or in any way production-ready. Questions and comments to [billba@microsoft.com](mailto:billba@microsoft.com). Please don't submit pull requests unless we have previously discussed it.

## Install, Build

1. Clone this repo
2. `npm install`
3. `npm run build` (to build on every change `npm run watch`, to build minified `npm run minify`)

## Obtain security credentials for your bot

1. If you haven't already, [register your bot](https://dev.botframework.com/bots/new)
2. Add a DirectLine channel, and generate a Direct Line Secret
3. For testing you can use your Secret as a security token but for production you will likely want to exchange that secret for a Token as detailed in the Direct Line [documentation](https://docs.botframework.com/en-us/restapi/directline/).

## Decide how to run the botchat

### As a component in your React webapp

1. Include public/botchat.js and you will get a React component called BotChat.App
2. For TypeScript users there is a definition file called public/botchat.d.ts
3. Pass in the appropriate properties (listed in botchat.d.ts)

### Directly in its own web page

1. This method requires passing your Secret in the querystring, and as such should only be used for local testing
2. Start a local web server (I use http-server) and aim your browser at `http://localhost:{port}?s={Secret}`

### Embedded via IFRAME

1. Follow the above instructions to serve the botchat in its own web page
2. In your web server, inject the appropriate properties (listed in botchat.d.ts) by replacing the line labelled `// ADD MORE CONFIG HERE` in index.html 
3. In your web server, exchange the Secret for a Token as detailed in the Direct Line [documentation](https://docs.botframework.com/en-us/restapi/directline/).
4. In a second web page, embed the botchat via `<iframe src="http://{host}:{port}?t={Token}" width="400" height="500"/>`

(An example of this approach is [botchattest](https://github.com/billba/botchattest))

# Copyright & License

© 2016 Microsoft Corporation

[MIT License](/LICENSE)
