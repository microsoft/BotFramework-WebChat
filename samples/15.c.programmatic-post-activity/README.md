# Sample - Programmatic access to post activity

When the 'Help' button is clicked, an activity will be sent programmatically to the bot.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/15.c.programmatic-post-activity)

# Things to try out

-  Click the "Help" button on upper-left hand corner

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

# Overview

This is a simple sample that shows you how to send activities programmatically to the bot.

First, let's implement our own version of Web Chat store.

```diff
+ const store = window.WebChat.createStore();

  window.WebChat.renderWebChat({
    directLine: window.WebChat.createDirectLine({ token }),
+   store
  }, document.getElementById('webchat'));
```

Next, add a button that says help to our DOM.

```diff
+ <button id="helpButton" type="button">Help</button>
```

Finally, let's connect the button to Web Chat by adding an event listener and dispatching a post to the bot when the button is clicked.

```diff
+ document.querySelector('#helpButton').addEventListener('click', () => {
+   store.dispatch({
+     type: 'WEB_CHAT/SEND_MESSAGE',
+     payload: { text: 'help' }
+   });
+ });
```

## Completed Code

Here is the finished `index.html`:

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Programmatic access to post activity</title>
    <!--
      This CDN points to the latest official release of Web Chat. If you need to test against Web Chat's latest bits, please refer to pointing to Web Chat's MyGet feed:
      https://github.com/microsoft/BotFramework-WebChat#how-to-test-with-web-chats-latest-bits
    -->
    <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
    <style>
      html, body { height: 100% }
      body { margin: 0 }

      #webchat {
        height: 100%;
        width: 100%;
      }

      #helpButton {
        left: 10px;
        position: absolute;
        top: 10px;
      }
    </style>
  </head>
  <body>
    <div id="webchat" role="main"></div>
+   <button id="helpButton" type="button">Help</button>
    <script>
      (async function () {

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();

+       const store = window.WebChat.createStore();

        window.WebChat.renderWebChat({
          directLine: window.WebChat.createDirectLine({ token }),
+         store
        }, document.getElementById('webchat'));

+       document.querySelector('#helpButton').addEventListener('click', () => {
+         store.dispatch({
+           type: 'WEB_CHAT/SEND_MESSAGE',
+           payload: { text: 'help' }
+         });
+       });

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>

```

# Further reading

[`15.b.incoming-activity-event`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/15.a.incoming-activity-event) is a sample that will fire JavaScript event on all incoming activities.

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
