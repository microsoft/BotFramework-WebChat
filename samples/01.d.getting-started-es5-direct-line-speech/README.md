# Sample - Getting Started with Web Chat ES5 bundle with Direct Line Speech

## Description

A simple web page with a maximized Web Chat that connect to Direct Line Speech channel and works under Internet Explorer 11.

Although the web page works under Internet Explorer 11, the speech recognition and synthesis will be disabled when running under Internet Explorer 11. When running the web page under a browser with required media capabilities, speech recognition and synthesis will be enabled/

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/01.d.getting-started-es5-direct-line-speech)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/01.d.getting-started-es5-direct-line-speech` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Type `hello`: you should see the initials displayed next to user and bot speech bubbles in the transcript.

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Getting started

### Goals of this bot

This sample will show you how to implement your own initials displayed next to .

This sample starts with the [ES5 bundle CDN sample](./../01.a.getting-started-es5-bundle/README.md) as the base template.

First, we will remove the existing fetch token call with a `fetchCredentials` function, which asynchronously return a JavaScript object of `{ authorizationToken: string, region: string }` in a Promise fashion.

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

Then, we will create a Direct Line Speech adapter set with the `fetchCredentials` function asynchronously. And use the adapter set to initialize Web Chat.

```diff
+ window.WebChat.createDirectLineSpeechAdapters({ fetchCredentials: fetchCredentials }).then(function(adapters) {
    window.WebChat.renderWebChat(
-     {
-       directLine: window.WebChat.createDirectLine({
-         token: token
-       })
-     },
+     adapters,
      document.getElementById('webchat')
    );

    document.querySelector('#webchat > *').focus();
  });
```

## Completed code

Here is the finished `index.html`:

```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Avatar with images and initials</title>
    <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
    <style>
      html, body { height: 100% }
      body { margin: 0 }

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
        window.WebChat.renderWebChat(
          Object.assign({}, adapters),
          document.getElementById('webchat')
        );

        document.querySelector('#webchat > *').focus();
      });
    </script>
  </body>
</html>
```

# Further reading

-  [Getting Started with Web Chat CDN with ES5 Polyfills](https://microsoft.github.io/BotFramework-WebChat/01.d.getting-started-es5-direct-line-speech) | [(Getting Started with Web Chat CDN with ES5 Polyfills source code)](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.d.getting-started-es5-direct-line-speech/)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
