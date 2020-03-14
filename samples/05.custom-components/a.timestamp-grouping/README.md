# Sample - Customize Timestamp Grouping

This sample shows Web Chat users how to choose how groups of messages will be grouped by timestamp.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/a.timestamp-grouping)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/05.custom-components/a.timestamp-grouping` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Watch the messages appear from Mock Bot.
-  Note that 'Default grouping' will show all 7 messages in one timestamp (the text that says 'Just now') immediately below the latest message
-  You can change timestamp groupings according to your bot's needs.

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview

> Note: this `README.md` skips over a lot of the HTML and CSS in this sample -- the skipped markup and code is for displaying the ability to change timestamps, and is not related to updating the timestamp grouping itself.

First, create your timestamp variable, which you will pass into Web Chat to indicate how you want your timestamps to be grouped. The following options are avaiable by default:

-  Set to `undefined` to use default grouping (5 minutes)
-  Set to `false` to not show any timestamps
-  Set to `1000` to hide timestamps if they are less than 1 second apart. This can be adjusted (in milliseconds) to any desired number
-  Set to `0` to show a timestamp with every message

<!-- prettier-ignore-start -->
```js
const groupTimestamp = false;
```
<!-- prettier-ignore-end -->

Modify the Web Chat object by passing the timestamp into `renderWebChat`

```diff
  window.WebChat.renderWebChat({
    directLine: window.WebChat.createDirectLine({ token }),
+   styleOptions: {
+     groupTimestamp
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
    <title>Web Chat: Configurable timestamp grouping</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script crossorigin="anonymous" src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
    <style>
      html,
      body {
        height: 100%;
      }

      body {
        display: flex;
        flex-direction: column;
        height: 100%;
        margin: 0;
      }

      #webchat {
        flex: 1;
      }

      #webchat {
        height: 100%;
        width: 100%;
      }

      #buttonBar {
        display: flex;
        flex-wrap: wrap;
        left: 10px;
        margin: 0;
        position: absolute;
        top: 10px;
      }

      #buttonBar > a {
        border: solid 2px #0063b1;
        color: #0063b1;
        font-family: Calibri, 'Helvetica Neue', Arial, sans-serif;
        font-size: 80%;
        margin: 0 10px 10px 0;
        padding: 5px 8px;
        text-decoration: none;
      }

      #buttonBar > a.selected {
        background-color: #0063b1;
        color: White;
      }
    </style>
  </head>
  <body>
    <div id="webchat" role="main"></div>

    <p id="buttonBar">
      <a href="?ts=default">Default grouping</a>
      <a href="?ts=false">Don't show timestamp</a>
      <a href="?ts=0">Don't group</a>
      <a href="?ts=2000">Group by 2 seconds</a>
      <a href="?ts=300000">Group by 5 minutes</a>
    </p>

    <script>
      'use strict';

      const groupTimestamp = new URLSearchParams(window.location.search).get('ts') || 'default';

      document.querySelectorAll('#buttonBar > a').forEach(hyperlink => {
        if (hyperlink.getAttribute('href') === `?ts=${groupTimestamp}`) {
          hyperlink.className = 'selected';
        }
      });

      (async function() {

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();
        const store = window.WebChat.createStore({}, ({ dispatch }) => next => action => {
          if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
            dispatch({ type: 'WEB_CHAT/SEND_MESSAGE', payload: { text: 'timestamp' } });
          }

          return next(action);
        });

        window.WebChat.renderWebChat(
          {
            directLine: window.WebChat.createDirectLine({ token }),

            styleOptions: {
              groupTimestamp:
                groupTimestamp === 'default' ? undefined : groupTimestamp === 'false' ? false : +groupTimestamp
            },
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

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
