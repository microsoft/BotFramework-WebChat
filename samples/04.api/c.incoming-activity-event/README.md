# Sample - Forward All Incoming Activities to a JavaScript Event

This sample shows how to set up a Web Chat client that will forward all incoming activity to a JavaScript event named `webchatincomingactivity`.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/04.api/c.incoming-activity-event)

# Things to try out

-  Open development console in your browser
-  Type "help" in the send box
-  In the console log, you will see bunches of incoming activities sent from the bot

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

# Overview

First, we will set up our store to use middleware that will dispatch an event whenever an incoming activity is received.

> When processing any bot activities, always validate its content against an allowed list and treat it as user input.

```diff
  const store = window.WebChat.createStore(
    {},
    ({ dispatch }) => next => action => {
+      if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
+        const event = new Event('webchatincomingactivity');

+        event.data = action.payload.activity;
+        window.dispatchEvent(event);
+      }

      return next(action);
    }
  );
```

Next, add an event listener to write to the console whenever `webchatincomingactivity` is detected, like so:

```diff
+ window.addEventListener('webchatincomingactivity', ({ data }) => {
+   console.log(`Received an activity of type "${ data.type }":`);
+   console.log(data);
+ });
```

Make sure our new store is added to the render of Web Chat, and that's it!

```diff
  window.WebChat.renderWebChat({
    directLine: window.WebChat.createDirectLine({ token }),
+   store
  }, document.getElementById('webchat'));
```

## Completed Code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Incoming activity to JavaScript event</title>
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

        const res = await fetch('https://hawo-mockbot4-token-app.blueriver-ce85e8f0.westus.azurecontainerapps.io/api/token/directline', { method: 'POST' });
        const { token } = await res.json();

        const store = window.WebChat.createStore({}, ({ dispatch }) => next => action => {
          if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
            const event = new Event('webchatincomingactivity');

            event.data = action.payload.activity;
            window.dispatchEvent(event);
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

        window.addEventListener('webchatincomingactivity', ({ data }) => {
          console.log(`Received an activity of type "${data.type}":`);
          console.log(data);
        });

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>
```
<!-- prettier-ignore-end -->

# Further reading

[`04.api/b.piggyback-on-outgoing-activities`](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/04.api/b.piggyback-on-outgoing-activities) is a sample that will add custom data to every outgoing activity.

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples)
