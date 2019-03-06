# Sample - Programmatic access to post activity

This sample shows how to implement a welcome activity when the bot first starts. This is a very popular feature.

# Test out the hosted sample

- [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/15.d.backchannel-send-welcome-event)

# Things to try out

- Note the welcome event that appears from the bot when you first open the page.

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

# Overview

This popular feature is often implemented as a welcome message from the bot.

We will simply implement our own store and add an activity when `'DIRECT_LINE/CONNECT_FULFILLED'` events are detected, like so:

```diff
 const store = window.WebChat.createStore({}, ({ dispatch }) => next => action => {
+   if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
+     dispatch({
+       type: 'WEB_CHAT/SEND_EVENT',
+       payload: {
+         name: 'webchat/join',
+         value: { language: window.navigator.language }
+       }
+     });
+   }

    return next(action);
  });
```

On your bot, you will need to add a filter to post the welcome message when `webchat/join` activities are detected.

Mock Bot welcome message:
```js
if (context.activity.name === 'webchat/join') {
  await context.sendActivity(`Got \`webchat/join\` event, your language is \`${ (context.activity.value || {}).language }\``);
}
```


## Completed Code
Here is the finished `index.html`:


```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Send welcome event</title>

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
    <div id="webchat"></div>
    <script>
      (async function () {

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();

+       const store = window.WebChat.createStore({}, ({ dispatch }) => next => action => {
+         if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
+           dispatch({
+             type: 'WEB_CHAT/SEND_EVENT',
+             payload: {
+               name: 'webchat/join',
+               value: { language: window.navigator.language }
+             }
+           });
+         }
+         return next(action);
+       });

        window.WebChat.renderWebChat({
          directLine: window.WebChat.createDirectLine({ token }),
+        store
        }, document.getElementById('webchat'));

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>

```

# Further reading

[`15.b.incoming-activity-event`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/15.a.incoming-activity-event) is a sample that will fire JavaScript event on all incoming activities.

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples)
