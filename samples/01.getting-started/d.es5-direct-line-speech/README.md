# Sample - Getting Started with Web Chat ES5 bundle and Direct Line Speech

## Description

A simple web page with a maximized Web Chat that connects to the Direct Line Speech channel and works in Internet Explorer 11.

Although the web page works in Internet Explorer 11, the speech recognition and synthesis will be disabled when running in IE11. When running the web page under a browser with required media capabilities, speech recognition and synthesis will be enabled

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/d.es5-direct-line-speech)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/01.getting-started/d.es5-direct-line-speech` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Type `help`: you should see a full list of MockBot features
-  Type `markdown`: you should see the sample of Markdown
-  Type `card weather`: you should see a weather card built using Adaptive Cards
-  Type `layout carousel`: you should see a carousel of cards
   -  Resize the window and see how the carousel changes size

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Getting started

### Goals of this bot

This code features the minimal scripting the bot needs to host a full-featured Web Chat and Direct Line Speech channel, with IE11 backwards compatibility.

This sample starts with the [ES5 bundle CDN sample](./../01.getting-started/c.es5-bundle/README.md) as the base template.

First, we will remove the existing fetch token call with a `fetchCredentials` function, which asynchronously returns a JavaScript object of `{ authorizationToken: string, region: string }` in a Promise fashion.

<!-- prettier-ignore-start -->
```js
const fetchCredentials = function() {
  return window
    .fetch('https://webchat-mockbot-streaming.azurewebsites.net/speechservices/token', {
      method: 'POST'
    })
    .then(function(res) {
      return res.json();
    })
    .then(function(json) {
      return {
        authorizationToken: json.token,
        region: json.region
      };
    });
};
```
<!-- prettier-ignore-end -->

Next we will create a Direct Line Speech adapter set with the `fetchCredentials` function asynchronously and use the adapter set to initialize Web Chat.

```diff
+ window.WebChat.createDirectLineSpeechAdapters({ fetchCredentials: fetchCredentials }).then(function(adapters) {
    window.WebChat.renderWebChat(
-     {
-       directLine: window.WebChat.createDirectLine({
-         token: token
-       })
-     },
+     Object.assign({}, adapters),
      document.getElementById('webchat')
    );

    document.querySelector('#webchat > *').focus();
  });
```

> If you need to pass options to Web Chat, replace the `{}` with your options.

## Completed code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Full-featured bundle with ES5 polyfills and Direct Line Speech channel</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script crossorigin="anonymous" src="https://cdn.botframework.com/botframework-webchat/latest/webchat-es5.js"></script>
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
      const fetchCredentials = function() {
        return window
          .fetch('https://webchat-mockbot-streaming.azurewebsites.net/speechservices/token', {
            method: 'POST'
          })
          .then(function(res) {
            return res.json();
          })
          .then(function(json) {
            return {
              authorizationToken: json.token,
              region: json.region
            };
          });
      };

      window.WebChat.createDirectLineSpeechAdapters({ fetchCredentials: fetchCredentials }).then(function(adapters) {
        window.WebChat.renderWebChat(Object.assign({}, adapters), document.getElementById('webchat'));

        document.querySelector('#webchat > *').focus();
      });
    </script>
  </body>
</html>
```
<!-- prettier-ignore-end -->

# Further reading

-  [Getting Started with Web Chat CDN with ES5 Polyfills](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/d.es5-direct-line-speech) | [(Getting Started with Web Chat CDN with ES5 Polyfills source code)](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/d.es5-direct-line-speech/)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
