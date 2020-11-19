# Sample - Customize activity status

This sample shows how to customize the activity status component through middleware.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/g.activity-status)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/05.custom-components/g.activity-status` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Type `echo Hello` to the bot
   -  Observe the timestamp change: the timestamp for the user now says "User at just now"
-  Turn on airplane mode and send anything
   -  When send fails, observe the timestamp becomes "Send failed." **without** the original retry prompt

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview

> Note: this sample is based from [`01.getting-started/e.host-with-react`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/e.host-with-react).

First, create a middleware to render activity status. The middleware will render activity status based on its send state and timestamp grouping. If the send state returns as failed, developers can add custom retry logic to the app.

```diff
  const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
  const { token } = await res.json();
  const { ReactWebChat } = window.WebChat;

+ const activityStatusMiddleware = () => next => args => {
+   const {
+     activity: {
+       from: { role }
+     },
+     sendState,
+     sameTimestampGroup
+   } = args;
+
+   if (sendState === 'sending') {
+     return <span className="activityStatus activityStatus__sendStatus">Sending&hellip;</span>;
+   } else if (sendState === 'send failed') {
+     return <span className="activityStatus">Send failed.</span>;
+   } else if (!sameTimestampGroup) {
+     return (
+       <span className="activityStatus activityStatus__timestamp">
+         <span className="activityStatus__timestampPretext">{role === 'user' ? 'User at ' : 'Bot at '}</span>
+         <span className="activityStatus__timestampContent">{next(args)}</span>
+       </span>
+     );
+   }

    return next(args);
  };

  window.ReactDOM.render(
    <ReactWebChat directLine={window.WebChat.createDirectLine({ token })} />,
    document.getElementById('webchat')
  );
```

Then, pass the middleware to React thru props.

```diff
  window.ReactDOM.render(
-   <ReactWebChat directLine={window.WebChat.createDirectLine({ token })} />,
+   <ReactWebChat
+     activityStatusMiddleware={activityStatusMiddleware}
+     directLine={window.WebChat.createDirectLine({ token })}
+   />,
    document.getElementById('webchat')
  );
```

Lastly, set the CSS so the customized timestamp looks fleshed out.

```diff
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

+ .activityStatus {
+   color: #767676;
+   font-family: Calibri, 'Helvetica Neue', Arial, sans-serif;
+ }
+
+ .activityStatus__sendStatus,
+ .activityStatus__timestampPretext {
+   font-size: 80%;
+ }
+
+ .activityStatus__timestampContent {
+   text-transform: lowercase;
+ }
```

## Completed code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Customize activity status</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script crossorigin="anonymous" src="https://unpkg.com/@babel/standalone@7.8.7/babel.min.js"></script>
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

      .activityStatus {
        color: #767676;
        font-family: Calibri, 'Helvetica Neue', Arial, sans-serif;
      }

      .activityStatus__sendStatus,
      .activityStatus__timestampPretext {
        font-size: 80%;
      }

      .activityStatus__timestampContent {
        text-transform: lowercase;
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

        const activityStatusMiddleware = () => next => args => {
          const {
            activity: {
              from: { role }
            },
            sendState,
            sameTimestampGroup
          } = args;

          if (sendState === 'sending') {
            return <span className="activityStatus activityStatus__sendStatus">Sending&hellip;</span>;
          } else if (sendState === 'send failed') {
            return <span className="activityStatus">Send failed.</span>;
          } else if (!sameTimestampGroup) {
            return (
              <span className="activityStatus activityStatus__timestamp">
                <span className="activityStatus__timestampPretext">{role === 'user' ? 'User at ' : 'Bot at '}</span>
                <span className="activityStatus__timestampContent">{next(args)}</span>
              </span>
            );
          }

          return next(args);
        };

        window.ReactDOM.render(
          <ReactWebChat
            activityStatusMiddleware={activityStatusMiddleware}
            directLine={window.WebChat.createDirectLine({ token })}
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

[`useRenderActivityStatus` hook](https://github.com/microsoft/BotFramework-WebChat/blob/master/docs/HOOKS.md#useRenderActivityStatus)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
