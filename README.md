# MSBotChat

Sample chat app for the [Microsoft Bot Framework](http://www.botframework.com) using the [DirectLine](http://docs.botframework.com/sdkreference/restapi-directline/) API.

## How real is this?

Rapidly-evolving proof of concept. Not currently supported or in any way production-ready. Questions and comments to [billba@microsoft.com](mailto:billba@microsoft.com). Please don't submit pull requests unless we have previously discussed it.

I keep [notes](./notes.md) reflecting my current thinking. I try to keep them reasonably up to date.  

## Install, Build, Run

1. Clone this repo
2. `npm install`
3. `npm run typings`
4. `npm run build` (to build on every change `npm run watch`, to build minified `npm run minify`)
5. Start a local web server (I used http-server) and aim your browser at http://localhost/{port}/test.html (for TestBot) or http://localhost/{port}/index.html?s={appsecret} using the DirectLine app secret for your bot

# Copyright & License

© 2016 Microsoft Corporation

[MIT License](/LICENSE)
