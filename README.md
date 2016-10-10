# MSBotChat

Sample chat app for the [Microsoft Bot Framework](http://www.botframework.com) using the [DirectLine](http://docs.botframework.com/sdkreference/restapi-directline/) API.

You can easily play with a recent build using [botchattest](https://botchattest.herokuapp.com)

## How real is this?

Rapidly-evolving proof of concept. Not currently supported or in any way production-ready. Questions and comments to [billba@microsoft.com](mailto:billba@microsoft.com). Please don't submit pull requests unless we have previously discussed it.

## Install, Build, Run

1. Clone this repo
2. `npm install`
3. `npm run build` (to build on every change `npm run watch`, to build minified `npm run minify`)
4. Start a local web server (I use http-server) and aim your browser at http://localhost:{port}/index.html?s={appsecret} using the DirectLine app secret for your bot

or

4. Embed the botchat using `<iframe src="http://localhost:{port}/index.html?s={appsecret}" width="320" height="500"/>`

# Copyright & License

© 2016 Microsoft Corporation

[MIT License](/LICENSE)
