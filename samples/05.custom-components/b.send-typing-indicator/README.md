# Sample - Enable Typing Indicator

This sample shows how to send `typing` activity when the user type. When the Mock Bot receive the `typing` activity, it will display a message with a timestamp.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/b.send-typing-indicator)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/05.custom-components/b.send-typing-indicator` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

> Note: when the sample start, it will send a message `echo-typing-as-message` to the Mock Bot. After the bot received this command, it will reply to all `typing` activities sent from the user.

-  When you type, the bot will send a message indicate the time it received the `typing` activity

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview

> Note: this `README.md` skips over a lot of the HTML and CSS in this sample -- the skipped markup and code is to visibly show the `sendTypingIndicator`.

All you need to do is add the `sendTypingIndicator` option to the `renderWebChat` method. The default value is `false`.

```diff
  window.WebChat.renderWebChat({
    directLine: window.WebChat.createDirectLine({ token }),
+   sendTypingIndicator: true
  }, document.getElementById('webchat'));
```

## Completed code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Send typing indicator</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script crossorigin="anonymous" src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
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
      (async function() {

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();

        const store = window.WebChat.createStore({}, ({ dispatch }) => next => action => {
          if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
            dispatch({ type: 'WEB_CHAT/SEND_MESSAGE', payload: { text: 'echo-typing-as-message' } });
          }

          return next(action);
        });

        window.WebChat.renderWebChat(
          {
            directLine: window.WebChat.createDirectLine({ token }),
            sendTypingIndicator: true,
            store
          },
          document.getElementById('webchat')
        );

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>
```
<!-- prettier-ignore-end -->

# Further reading

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples)
