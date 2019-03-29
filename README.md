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
  * auto show upload button when `inputHint` property of last incoming activity was `expectingUpload`

## How to add Web Chat to your website

### What you will get from Feedyou
These are configuration values you will get from Feedyou during WebChat implemenation phase.

  * `DirectLine secret` is used for authentication
  * `Bot ID` is string in format `feedbot-*`
  * `Bot name` will be shown as author name of messages from bot

Please paste these values to places marked by `...` in examples.

### What you will need to do on your website

Include `botchat.css`, `botchat-es5.js` (from our https://feedyou.blob.core.windows.net/webchat/latest CDN) and following code into your website and paste required values you got from Feedyou. It will create expandable webchat in bottom right corner for you.

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
      BotChat.App({
        directLine: { secret: '...' },                  
        bot: { id: 'feedbot-...', name: '...' }
        theme: { mainColor: "#e51836" },
        header: { text: "Chatbot", textWhenCollapsed: "Click for chatbot!" }
        // OPTIONAL - locale: '...', // en/cs/...
        // OPTIONAL - user: { id: '...some by-user unique ID', name: 'User name' },
      });
    </script>
  </body>
</html>
```

> If you don't want to use polyfills for older browsers, you can use `botchat.js` instead of default `botchat-es5.js`.

If you want to make the expansion logic by yourself or you want to put bot directly into some element in your page, you can check out our examples:
  - [/samples/feedyou/code.html](https://github.com/wearefeedyou/feedbot-webchat/blob/master/samples/feedyou/code.html) show the most simple way how to inject webchat into your page which you can also use with GTM or some other tag manager
  -	[/samples/feedyou/embed.html](https://github.com/wearefeedyou/feedbot-webchat/blob/master/samples/feedyou/embed.html)	when you want to embed bot into given element of your page
  -	[/samples/feedyou/expandable.html](https://github.com/wearefeedyou/feedbot-webchat/blob/master/samples/feedyou/expandable.html) when you want to make expansion logic by yourself (note that `BotChat` component is initialized only after chat window is expanded, so bot is not triggered for users who not open chat)
  - [/samples/feedyou/full.html](https://github.com/wearefeedyou/feedbot-webchat/blob/master/samples/feedyou/full.html) when webchat should be the main element on the page
  -	[/samples/feedyou/persistent.html](https://github.com/wearefeedyou/feedbot-webchat/blob/master/samples/feedyou/persistent.html) special configuration which allows to persist bot history between page reloads (by disabling WebSocket and using HTTP pooling instead)
  
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

### Advanced configuration
If you want to use WebChat directly as the component in your React app or you just want to customize it more than described above, check out the [advanced README](https://github.com/wearefeedyou/feedbot-webchat/blob/master/README-ADVANCED.md) or contact [Feedyou](mailto:hello@feedyou.agency) directly.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
-->

## Copyright & License

© 2016 Microsoft Corporation

[MIT License](/LICENSE)
