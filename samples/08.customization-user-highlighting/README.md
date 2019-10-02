# Sample - Customize Web Chat with User Highlighting

This sample showcases the ability to add styling based on the activity Web Chat is displaying. In this case, activities sent by the user will be highlighted in green on the right-hand side. Activities from bot will have a red band on the left-hand side. This sample is implemented with React and makes changes that are based off of the [host with React sample](../03.a.host-with-react).

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/08.customization-user-highlighting)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/08.customization-user-highlighting` in command line
-  Run `npx serve` in the full-bundle directory
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Send normal messages
-  Type `layout carousel` and see how the decorators work with the band

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview

We'll start by using the [host with React sample](../03.a.host-with-react) as our Web Chat React template.

`activityMiddleware` can be used to add to the currently existing DOM of Web Chat by filtering the bot's content based on activity. In this instance we are going to add a containing `<div>` to the activity (with extra styling) based on the activity's `role` value.

First, let's style our new containers using glamor. The container for activities from the bot will have a solid red line on the left side of the `<div>`, and activities from the user will have a green line on the right.

```diff
+ const { css } = window.Glamor;

+ const HIGHLIGHT_FROM_BOT_CSS = css({
+   borderLeftColor: 'Red',
+   borderLeftStyle: 'solid',
+   borderLeftWidth: 5,
+   marginLeft: 8
+ });

+ const HIGHLIGHT_FROM_USER_CSS = css({
+   borderRightColor: 'Green',
+   borderRightStyle: 'solid',
+   borderRightWidth: 5,
+   marginRight: 8
+ });
```

Next, create the `activityMiddleware` which will be passed into the bot. We will return the content of the activity with a new wrapper that will display our new classes when the correct criterion are met.

```js
const activityMiddleware = () => next => card => {
  return (
    children =>
      <div>
        <!-- content here -->
      </div>
  );
};
```

Since we know we want to filter by the role value in the activity, we will use a ternary statement to differentiate between `'user'` and the bot. That check should look be: `card.activity.from.role`

```diff
const activityMiddleware = () => next => card => {
  return (
    children =>
+     <div key={() => card.activity.id} className={ card.activity.from.role === 'user' ? HIGHLIGHT_FROM_USER_CSS : HIGHLIGHT_FROM_BOT_CSS }>
        <!-- content here -->
      </div>
  );
};
```

`{ next(card)(children) }` indicates the middleware can pass to the next renderer. The subsequent results of those middleware calls will be what is displayed inside the `<div>`. Make sure to add this into `activityMiddleware` like so:

```diff
const activityMiddleware = () => next => card => {
  return (
    children =>
      <div key={() => card.activity.id} className={ card.activity.from.role === 'user' ? HIGHLIGHT_FROM_USER_CSS : HIGHLIGHT_FROM_BOT_CSS }>
+       { next(card)(children) }
      </div>
  );
};
```

Pass `activityMiddleware` into the rendering of Web Chat, and that's it.

## Completed code

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Custom attachment with GitHub Stargazers</title>

    <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
    <script src="https://unpkg.com/react@16.5.0/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@16.5.0/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/react-redux@5.0.7/dist/react-redux.min.js"></script>
    <script src="https://unpkg.com/glamor@2.20.40/umd/index.js"></script>

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
    <script type="text/babel">
      (async function () {
        'use strict';

        // In this demo, we are using Direct Line token from MockBot.
        // To talk to your bot, you should use the token exchanged using your Direct Line secret.
        // You should never put the Direct Line secret in the browser or client app.
        // https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication

+       const { css } = window.Glamor;

+       const HIGHLIGHT_FROM_BOT_CSS = css({
+         borderLeftColor: 'Red',
+         borderLeftStyle: 'solid',
+         borderLeftWidth: 5,
+         marginLeft: 8
+       });

+       const HIGHLIGHT_FROM_USER_CSS = css({
+         borderRightColor: 'Green',
+         borderRightStyle: 'solid',
+         borderRightWidth: 5,
+         marginRight: 8
+       });

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();
        const { ReactWebChat } = window.WebChat;
+       const activityMiddleware = () => next => card => {
+         return (
+           children =>
+             <div key={() => card.activity.id} className={ card.activity.from.role === 'user' ? HIGHLIGHT_FROM_USER_CSS : HIGHLIGHT_FROM_BOT_CSS }>
+               { next(card)(children) }
+             </div>
+         );
+       };

        window.ReactDOM.render(
          <ReactWebChat
+           activityMiddleware={ activityMiddleware }
            directLine={ window.WebChat.createDirectLine({ token }) }
          />,
          document.getElementById('webchat')
        );

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>

```

# Further reading

-  CSS in JavaScript - [glamor npm](https://www.npmjs.com/package/glamor)

-  [Middleware wiki](https://en.wikipedia.org/wiki/Middleware)

-  [Reaction buttons bot](https://microsoft.github.io/BotFramework-WebChat/09.customization-reaction-buttons) | [(Reaction buttons source code)](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/09.customization-reaction-buttons)

-  [Card components bot](https://microsoft.github.io/BotFramework-WebChat/10.a.customization-card-components) | [(Card components source code)](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/10.a.customization-card-components)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
