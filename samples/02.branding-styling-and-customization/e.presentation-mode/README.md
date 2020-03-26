# Sample - Presentation Mode

Enable presentation mode by:

-  Disabling interactivity in Adaptive Cards, rich cards, send box, and suggested actions
-  Hide the send box

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/02.branding-styling-and-customization/e.presentation-mode)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/02.branding-styling-and-customization/e.presentation-mode` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Mock Bot programmatically adds the commands that normally display suggested actions and the inputs Adaptive Card.
-  Notice that the Adaptive Card displayed with inputs is disabled
-  Suggested actions are disabled
-  There is no Send Box

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview

This sample starts with the [full-bundle CDN sample](./../01.getting-started/a.full-bundle/README.md) as the base template.

The first chunk of new code in this sample is simply to invoke the card inputs and suggested actions commands to the store. You can use this code to similarly dispatch the commands you need to display in your presentation.

```diff
+ const store = window.WebChat.createStore({}, ({ dispatch }) => next => action => {
+   if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
+     dispatch({ type: 'WEB_CHAT/SEND_MESSAGE', payload: { text: 'card inputs' } });
+     dispatch({ type: 'WEB_CHAT/SEND_MESSAGE', payload: { text: 'suggested-actions' } });
+   }
+   return next(action);
+ });
```

Disable the Web Chat component, pass in your instance of the store, and hide the Send Box via `styleOptions`.

```diff
  window.WebChat.renderWebChat({
    directLine: window.WebChat.createDirectLine({ token }),
+   disabled: true,
+   store,
+   styleOptions: {
+     hideSendBox: true
+   }
  }, document.getElementById('webchat'));
```

## Completed code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Presentation mode</title>
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
            dispatch({ type: 'WEB_CHAT/SEND_MESSAGE', payload: { text: 'card inputs' } });
            dispatch({ type: 'WEB_CHAT/SEND_MESSAGE', payload: { text: 'suggested-actions' } });
          }

          return next(action);
        });

        window.WebChat.renderWebChat(
          {
            directLine: window.WebChat.createDirectLine({ token }),
            disabled: true,
            store,
            styleOptions: {
              hideSendBox: true
            }
          },
          document.getElementById('webchat')
        );
      })().catch(err => console.error(err));
    </script>
  </body>
</html>
```
<!-- prettier-ignore-end -->

# Further reading

-  [Branding styling bot](https://microsoft.github.io/BotFramework-WebChat/02.branding-styling-and-customization/a.branding-web-chat) | [(Branding styling source code)](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/02.branding-styling-and-customization/a.branding-web-chat)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
