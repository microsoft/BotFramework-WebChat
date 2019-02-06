# Sample - Customize Timestamp Grouping
This sample shows Web Chat users how to choose how groups of messages will be grouped by timestamp.

# Test out the hosted sample
- [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/07.a.customization-timestamp-grouping)

# How to run
- Fork this repository
- Navigate to `/Your-Local-WebChat/samples/07.a.customization-timestamp-grouping` in command line
- Run `npx serve`
- Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

- Watch the messages appear from Mock Bot.
- Note that 'Default grouping' will show all 7 messages in one timestamp (the text that says 'Just now') immediately below the latest message
- You can change timestamp groupings according to your bot's needs.

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview
> Note: this `README.md` skips over a lot of the HTML and CSS in this sample -- the skipped markup and code is for displaying the ability to change timestamps, and is not related to updating the timestamp grouping itself.

First, create your timestamp variable, which you will pass into Web Chat to indicate how you want your timestamps to be grouped. The following options are avaiable by default:
 - Set to `undefined` to use default grouping (5 minutes)
 - Set to `false` to not show any timestamps
 - Set to `1000` to hide timestamps if they are less than 1 second apart. This can be adjusted (in milliseconds) to any desired number
 - Set to `0` to show a timestamp with every message


```js
const groupTimestamp = false;
```

Modify the Web Chat object by passing the timestamp into `renderWebChat`

```diff
  window.WebChat.renderWebChat({
    directLine: window.WebChat.createDirectLine({ token }),
+   groupTimestamp: groupTimestamp,
  }, document.getElementById('webchat'));
```
## Completed code

Here is the finished `index.html`:

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Configurable timestamp grouping</title>

    <script src="https://cdn.botframework.com/botframework-webchat/master/webchat.js"></script>
    <style>
      #webchat {
        height: 100%;
        width: 100%;
      }
    </style>
  </head>
  <body>
    <div id="webchat" role="main"></div>
    <script>
      'use strict';

+     const groupTimestamp = false;

      (async function () {

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();

        window.WebChat.renderWebChat({
          directLine: window.WebChat.createDirectLine({ token }),
+         groupTimestamp: groupTimestamp,
        }, document.getElementById('webchat'));

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>

```
# Further reading

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples)
