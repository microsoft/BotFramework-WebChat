# Sample - Programmatic access to post activity

This sample shows how to implement a welcome activity when the bot first starts. This is a very popular feature.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/04.api/a.welcome-event)

# Things to try out

-  Note the welcome event that appears from the bot when you first open the page.

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

<!-- prettier-ignore-start -->
```js
if (context.activity.name === 'webchat/join') {
  await context.sendActivity(
    `Got \`webchat/join\` event, your language is \`${(context.activity.value || {}).language}\``
  );
}
```
<!-- prettier-ignore-end -->

## Completed Code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Send welcome event</title>
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
    <div id="webchat"></div>
    <script>
      (async function() {
        const res = await fetch('https://hawo-mockbot4-token-app.blueriver-ce85e8f0.westus.azurecontainerapps.io/api/token/directline', { method: 'POST' });
        const { token } = await res.json();
        const store = window.WebChat.createStore({}, ({ dispatch }) => next => action => {
          if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
            dispatch({
              type: 'WEB_CHAT/SEND_EVENT',
              payload: {
                name: 'webchat/join',
                value: { language: window.navigator.language }
              }
            });
          }

          return next(action);
        });

        window.WebChat.renderWebChat(
          {
            directLine: window.WebChat.createDirectLine({ token }),
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

[`04.api/c.incoming-activity-event`](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/04.api/c.incoming-activity-event) is a sample that will fire JavaScript event on all incoming activities.

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples)
