# Sample - Enable Typing Indicator

This sample shows Web Chat users how to enable the typing indicator activity from the user, which on Mock Bot is displayed as an animated gif. This is a helpful feature in multi-user chats.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/07.b.customization-send-typing-indicator)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/07.b.customization-send-typing-indicator` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Note that when you as the user type, there is a typing indicator gif in the transcript. This is activated by the `sendTypingIndicator`.

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview

> Note: this `README.md` skips over a lot of the HTML and CSS in this sample -- the skipped markup and code is to visibly show the `sendTypingIndicator`.

All you need to do is add the `sendTypingIndicator` option to the `renderWebChat` method. The default value is `false`.

```diff
 window.WebChat.renderWebChat({
  directLine: window.WebChat.createDirectLine({ token }),
+ sendTypingIndicator: true,

}, document.getElementById('webchat'));

```

## Completed code

Here is the finished `index.html`:

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Send typing indicator</title>

    <script src="https://cdn.botframework.com/botframework-webchat/master/webchat.js"></script>
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
      (async function () {

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();

        window.WebChat.renderWebChat({
          directLine: window.WebChat.createDirectLine({ token }),
+         sendTypingIndicator: true,
        }, document.getElementById('webchat'));

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>

```

# Further reading

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples)
