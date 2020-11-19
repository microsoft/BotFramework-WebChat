# Sample - Customizing typing indicator

This sample shows how to customize the typing indicator

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/j.typing-indicator)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/05.custom-components/j.typing-indicator` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Type in the message box
-  Send `typing` or `typing 1` to the bot

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview

This sample is based on [`01.getting-started/e.host-with-react`](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/e.host-with-react).

In this sample, when the bot or the user is typing, it will show a prompt, "Currently typing: bot, user". The customization is done by registering a custom component using the `typingIndicatorMiddleware`.

> Note: the default typing indicator UI in Web Chat does not display the typing indicator for the user.

### Send typing activity when user start typing

First, enable sending typing indicator to the bot, by passing `true` to the `sendTypingIndicator` prop:

```diff
  window.ReactDOM.render(
-   <ReactWebChat directLine={window.WebChat.createDirectLine({ token })} />,
+   <ReactWebChat
+     directLine={window.WebChat.createDirectLine({ token })}
+     sendTypingIndicator={true}
+   />,
    document.getElementById('webchat')
  );
```

### Registering a custom component for typing indicator

Then, register a custom component to override the existing typing indicator:

```diff
  window.ReactDOM.render(
    <ReactWebChat
      directLine={window.WebChat.createDirectLine({ token })}
      sendTypingIndicator={true}
+     typingIndicatorMiddleware={() => next => ({ activeTyping }) => {
+       activeTyping = Object.values(activeTyping);
+
+       return (
+         !!activeTyping.length && (
+           <span className="webchat__typingIndicator">
+             Currently typing:{' '}
+             {activeTyping
+               .map(({ role }) => role)
+               .sort()
+               .join(', ')}
+           </span>
+         )
+       );
+     }}
    />,
    document.getElementById('webchat')
  );
```

The `activeTyping` argument is a map of participants who are actively typing:

<!-- prettier-ignore-start -->
```json
{
  "mockbot": {
    "name": "MockBot",
    "role": "bot",
    "start": 1581905716840,
    "end": 1581905766840
  },
  "dl_a1b2c3d": {
    "name": "John Doe",
    "role": "user",
    "start": 1581905716840,
    "end": 1581905766840
  }
}
```
<!-- prettier-ignore-end -->

`start` is the time when Web Chat receive the typing indicator from this participant. `end` is the time when the typing indicator should be hidden because the participant stopped typing, but did not send their message.

When a message is received from a participant who is actively typing, their entry in the `activeTyping` argument will be removed, indicating the typing indicator should be removed for them.

### Styling the typing indicator

Add the following CSS for styling the typing indicator:

<!-- prettier-ignore-start -->
```css
.webchat__typingIndicator {
  font-family: 'Calibri', 'Helvetica Neue', 'Arial', 'sans-serif';
  font-size: 14px;
  padding: 10px;
}
```
<!-- prettier-ignore-end -->

## Completed code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Customizing typing indicator</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script crossorigin="anonymous" src="https://unpkg.com/@babel/standalone@7/babel.min.js"></script>
    <script crossorigin="anonymous" src="https://unpkg.com/react@16.8.6/umd/react.development.js"></script>
    <script crossorigin="anonymous" src="https://unpkg.com/react-dom@16.8.6/umd/react-dom.development.js"></script>
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

      .webchat__typingIndicator {
        font-family: 'Calibri', 'Helvetica Neue', 'Arial', 'sans-serif';
        font-size: 14px;
        padding: 10px;
      }
    </style>
  </head>
  <body>
    <div id="webchat" role="main"></div>
    <script type="text/babel" data-presets="es2015,react,stage-3">
      (async function() {

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();
        const { ReactWebChat } = window.WebChat;

        window.ReactDOM.render(
          <ReactWebChat
            directLine={window.WebChat.createDirectLine({ token })}
            sendTypingIndicator={true}
            typingIndicatorMiddleware={() => next => ({ activeTyping }) => {
              activeTyping = Object.values(activeTyping);

              return (
                !!activeTyping.length && (
                  <span className="webchat__typingIndicator">
                    Currently typing:{' '}
                    {activeTyping
                      .map(({ role }) => role)
                      .sort()
                      .join(', ')}
                  </span>
                )
              );
            }}
          />,
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
