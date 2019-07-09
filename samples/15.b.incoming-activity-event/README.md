# Sample - Forward All Incoming Activities to a JavaScript Event

This sample shows how to set up a Web Chat client that will forward all incoming activity to a JavaScript event named `webchatincomingactivity`.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/15.b.incoming-activity-event)

# Things to try out

-  Open development console in your browser
-  Type "help" in the send box
-  In the console log, you will see bunches of incoming activities sent from the bot

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

# Overview

First, we will set up our store to use middleware that will dispatch an event whenever an incoming activity is received.

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
+ store
}, document.getElementById('webchat'));
```

## Completed Code

Here is the finished `index.html`:

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Incoming activity to JavaScript event</title>

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
      (async function () {

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();

        // We are adding a new middleware to customize the behavior of DIRECT_LINE/INCOMING_ACTIVITY.
        const store = window.WebChat.createStore(
          {},
          ({ dispatch }) => next => action => {
+           if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
+             const event = new Event('webchatincomingactivity');

+             event.data = action.payload.activity;
+             window.dispatchEvent(event);
+           }

            return next(action);
          }
        );

        window.WebChat.renderWebChat({
          directLine: window.WebChat.createDirectLine({ token }),
+         store
        }, document.getElementById('webchat'));

+       window.addEventListener('webchatincomingactivity', ({ data }) => {
+         console.log(`Received an activity of type "${ data.type }":`);
+         console.log(data);
+       });

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>

```

# Further reading

[`15.a.backchannel-piggyback-on-outgoing-activities`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/15.a.backchannel-piggyback-on-outgoing-activities) is a sample that will add custom data to every outgoing activity.

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
