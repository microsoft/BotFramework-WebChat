# Sample - Piggyback Data on Every Outgoing Activity

This sample shows how to add data to every outgoing activities as channel data.

Channel data is a channel-specific property bag that can be used to send non-standard in-band data.

> _Note: This is just a proof of concept thus should not be used in production
> and lacks security considerations._

If you haven't viewed it already, review and understanding of sample 11, which talks about middleware, would be extremely beneficial for this sample, linked in [further reading](#further-reading).

# Test out the hosted sample

- [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/15.a.backchannel-piggyback-on-outgoing-activities)

# How to run locally

- Fork this repository
- Navigate to `/Your-Local-WebChat/samples/15.a.backchannel-piggyback-on-outgoing-activities` in command line
- Run `npx serve` in the full-bundle directory
- Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out
- Type `channel-data`
   - This command will dump the channel data property bag received on the bot side

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview

In this sample, we will be using the package `simple-update-in` to update our immutable action objects. Let's add the minified js file from unpkg.com to the `<head>` of our html:

```diff
…
<head>
  <title>Web Chat: Inject data on post activity</title>
  <script src="https://cdn.botframework.com/botframework-webchat/master/webchat.js"></script>
+ <script src="https://unpkg.com/simple-update-in/dist/simple-update-in.production.min.js"></script>
…
```

This will allow us to use middleware to customize `DIRECT_LINE/POST_ACTIVITY` by updating the action with deep cloning.

```diff
…
const store = window.WebChat.createStore(
   {},
   ({ dispatch }) => next => action => {
   if (action.type === 'DIRECT_LINE/POST_ACTIVITY') {
+     action = window.simpleUpdateIn(action, ['payload', 'activity', 'channelData', 'email'], () => 'johndoe@example.com');
   }

   return next(action);
   }
);
…
```

All 'DIRECT_LINE/POST_ACTIVITY' sent on this bot will now have an email added to the channel data.

## Completed Code
Here is the finished `index.html`:

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Inject data on post activity</title>

    <script src="https://cdn.botframework.com/botframework-webchat/master/webchat.js"></script>

    <script src="https://unpkg.com/simple-update-in/dist/simple-update-in.production.min.js"></script>
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

+       const store = window.WebChat.createStore(
+         {},
+         ({ dispatch }) => next => action => {
+           if (action.type === 'DIRECT_LINE/POST_ACTIVITY') {

+             action = window.simpleUpdateIn(action, ['payload', 'activity', 'channelData', 'email'], () => 'johndoe@example.com');
+           }

+           return next(action);
+         }
+       );

        window.WebChat.renderWebChat({
          directLine: window.WebChat.createDirectLine({ token }),
+         store
        }, document.getElementById('webchat'));

        store.dispatch({
          type: 'WEB_CHAT/SET_SEND_BOX',
          payload: { text: 'channel-data' }
        });

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>

```

# Further reading

- [simple-update-in](https://www.npmjs.com/package/simple-update-in) on npmjs

[Customization of Redux Actions bot](https://microsoft.github.io/BotFramework-WebChat/11.customization-redux-actions) | [Customization of Redux Actions source code](./../11.customization-redux-actions)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples)
