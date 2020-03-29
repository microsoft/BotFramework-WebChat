# Sample - Customize Web Chat by Adding Middleware to Redux Store

A full-featured Web Chat with a custom Redux store where one can listen for all incoming activities and dispatch actions to.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/04.api/j.redux-actions)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/04.api/j.redux-actions` in command line
-  Run `npx serve` in the full-bundle directory
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Type `sample:backchannel`, you should see an `alert` prompt with the JSON of an activity

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview

### Goals of this bot

This sample starts with the [full-bundle CDN sample](./../01.getting-started/a.full-bundle/README.md) as the base template.

In this sample, we take advantage of the Web Chat (Redux) store to add custom functionality on the app hosting the bot when bot actions are sent. This means that your app can listen for the dispatch of actions from Web Chat, though you do not have the capability to modify the internal state of the store. Once your app receives the notification of that dispatch, you are free to add whatever customization your app requires.

In this case, Web Chat waits for the dispatch of an action with type `'event'` with the name `'sample:backchannel'`. Once it receives that action, the app will send an alert to the browser.

To see the bot actions you are able to intercept, please take a look at the [actions directory](https://github.com/microsoft/BotFramework-WebChat/tree/master/packages/core/src/actions) in the Web Chat repo. Note that you can also listen for any specific `activity.name` that pertains to your particular bot.

First, set up the store via the `createStore` method, which will be passed into the rendering of Web Chat. The first parameter is the initial state, which you can initialize as an empty object (`{}`) and the second is the middleware we will be applying.

<!-- prettier-ignore-start -->
```js
const store = window.WebChat.createStore({}, ({ dispatch } => next => action => next(action)));
```
<!-- prettier-ignore-end -->

Expand your middleware method to filter the activities you want to listen for (in this case, incoming activities). When the incoming activity is received, the activities will be further filtered to wait for the `activity.name` of `'sample:backchannel'`

```diff
  const store = window.WebChat.createStore(
    {},
    ({ dispatch }) => next => action => {
+     if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY'){
+       const { activity } = action.payload;

+       if (activity.type === 'event' && activity.name === 'sample:backchannel') {
+         //…
+       }
+     }

      return next(action);
+   }
  })
```

Next you need to add the code that the app will intercept with, in this case the alert.

```diff
  const store = window.WebChat.createStore(
    {},
    ({ dispatch }) => next => action => {
      if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY'){
        const { activity } = action.payload;

        if (activity.type === 'event' && activity.name === 'sample:backchannel') {
+         alert(JSON.stringify(activity, null, 2));
        }
      }

      return next(action)
    }
  );
```

Finally, pass in your new store to the Web Chat render method, and that's it.

```diff
  window.WebChat.renderWebChat({
    directLine: window.WebChat.createDirectLine({ token }),
+   store
  }, document.getElementById('webchat'));
```

## Completed code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Custom Redux store</title>
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
            dispatch({ type: 'WEB_CHAT/SEND_MESSAGE', payload: { text: 'sample:backchannel' } });
          } else if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
            const { activity } = action.payload;

            if (activity.type === 'event' && activity.name === 'sample:backchannel') {
              alert(JSON.stringify(activity, null, 2));
            }
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

-  Article on [Redux Middleware](https://medium.com/@jacobp100/you-arent-using-redux-middleware-enough-94ffe991e6)

-  [Piping to Redux bot](https://microsoft.github.io/BotFramework-WebChat/04.api/e.piping-to-redux/) | [Piping to Redux source code](./../04.api/e.piping-to-redux)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
