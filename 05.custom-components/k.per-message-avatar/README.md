# Sample - Customize per-message avatar

This sample shows how to customize avatar on a per-message basis.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/k.per-message-avatar)
-  [Try out a comprehensive live demo](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/k.per-message-avatar/comprehensive.html)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/05.custom-components/a.per-message-avatar` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Watch the messages appear from Mock Bot.

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview

> This sample is based on the [01.getting-started/e.host-with-react](https://github.com/microsoft/BotFramework-Webchat/tree/master/samples/01.getting-started/e.host-with-react).

This sample is separated into 2 phases:

-  Adding online status
-  Rendering a custom avatar

### Creating an online status component

First, create a React component, `<AvatarWithOnlineStatus>` that will decorate its children with an online status icon.

The component supports two online status: `"online"` and `"busy"`.

```diff
  const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
  const { token } = await res.json();
  const { ReactWebChat } = window.WebChat;

+ const AvatarWithOnlineStatus = ({ children, onlineStatus }) => {
+   return (
+     <div>
+       {children}
+       {onlineStatus && (
+         <div
+           className={`app__avatarWithOnlineStatus__status app__avatarWithOnlineStatus__status--${onlineStatus}`}
+         />
+       )}
+     </div>
+   );
+ };

  window.ReactDOM.render(
    <ReactWebChat directLine={window.WebChat.createDirectLine({ token })} />,
    document.getElementById('webchat')
  );
```

Then, add the stylesheet for the online status icon:

<!-- prettier-ignore-start -->
```css
.app__avatarWithOnlineStatus {
   display: flex;
   position: relative;
}

.app__avatarWithOnlineStatus .app__avatarWithOnlineStatus__status {
   background-color: White;
   border-radius: 50%;
   border: solid 2px White;
   bottom: -2px;
   height: 10px;
   position: absolute;
   right: -2px;
   transition: background-color 200ms;
   width: 10px;
}

.app__avatarWithOnlineStatus .app__avatarWithOnlineStatus__status.app__avatarWithOnlineStatus__status--online {
   background-color: #090;
}

.app__avatarWithOnlineStatus .app__avatarWithOnlineStatus__status.app__avatarWithOnlineStatus__status--busy {
   background-color: Red;
}
```
<!-- prettier-ignore-end -->

### Create an avatar middleware

Then, creates an avatar middleware that will render `<AvatarWithOnlineStatus>` on top of the original avatar.

`avatarMiddleware` should only return a function or `false`. If the avatar is hidden, it should return `false`. Otherwise, it should return a function, which when called, will render the avatar.

In the following sample, `renderAvatar` is the original avatar of type `false | () => React.Element`. If the avatar should not be shown, `renderAvatar` will be `false` and the middleware return it. Otherwise, `renderAvatar` will be: `() => React.Element`. The middleware will return `<AvatarWithOnlineStatus>` with the result of calling `renderAvatar()`.

We will also add `botAvatarInitials` and `userAvatarInitials` as `styleOptions`.

```diff
+ const avatarMiddleware = () => next => ({ fromUser, ...otherArgs }) => {
+   const renderAvatar = next({ fromUser, ...otherArgs });
+
+   return (
+     renderAvatar &&
+     (() => (
+       <AvatarWithOnlineStatus onlineStatus="online">
+         {renderAvatar()}
+       </AvatarWithOnlineStatus>
+     ))
+   );
+ };

  window.ReactDOM.render(
    <ReactWebChat
+     avatarMiddleware={avatarMiddleware}
      directLine={window.WebChat.createDirectLine({ token })}
+     styleOptions={{ botAvatarInitials: 'WC', userAvatarInitials: 'WW' }}
    />,
    document.getElementById('webchat')
  );
```

### (Optional) Making the component aware of right-to-left language

Make the component RTL aware by using the [`useDirection`](https://github.com/microsoft/BotFramework-WebChat/tree/master/docs/HOOKS.md#usedirection) hook.

```diff
  const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
  const { token } = await res.json();
- const { ReactWebChat } = window.WebChat;
+ const {
+   ReactWebChat,
+   hooks: { useDirection }
+ } = window.WebChat;

  const AvatarWithOnlineStatus = ({ children, onlineStatus }) => {
+   const [direction] = useDirection();

    return (
-     <div>
+     <div
+       className={`app__avatarWithOnlineStatus${direction === 'rtl' ? ' app__avatarWithOnlineStatus--rtl' : ''}`}
+     >
        {children}
        {onlineStatus && (
          <div
            className={`app__avatarWithOnlineStatus__status app__avatarWithOnlineStatus__status--${onlineStatus}`}
          />
        )}
      </div>
    );
  };

  window.ReactDOM.render(
    <ReactWebChat directLine={window.WebChat.createDirectLine({ token })} />,
    document.getElementById('webchat')
  );
```

Also, update the stylesheet with RTL awareness. In RTL mode, the online status icon will be shown on the bottom-left hand corner.

```diff
  .app__avatarWithOnlineStatus .app__avatarWithOnlineStatus__status {
    background-color: White;
    border-radius: 50%;
    border: solid 2px White;
    bottom: -2px;
    height: 10px;
    position: absolute;
-   right: -2px;
    transition: background-color 200ms;
    width: 10px;
  }

+ .app__avatarWithOnlineStatus:not(.app__avatarWithOnlineStatus--rtl) .app__avatarWithOnlineStatus__status {
+   right: -2px;
+ }
+
+ .app__avatarWithOnlineStatus.app__avatarWithOnlineStatus--rtl .app__avatarWithOnlineStatus__status {
+   left: -2px;
+ }

  .app__avatarWithOnlineStatus .app__avatarWithOnlineStatus__status.app__avatarWithOnlineStatus__status--online {
    background-color: #090;
  }

  .app__avatarWithOnlineStatus .app__avatarWithOnlineStatus__status.app__avatarWithOnlineStatus__status--busy {
    background-color: Red;
  }
```

### Use a portrait avatar

The second part of this sample will show how to customize the avatar using a rectangular image.

First, add a `<PortraitAvatar>` component, which houses the rectangular avatar image. This component will show different avatar images for bot and user.

<!-- prettier-ignore-start -->
```js
const PortraitAvatar = ({ fromUser }) => {
  return <img className="app__portraitAvatar" src={fromUser ? 'user.jpg' : 'bot.jpg'} />;
};
```
<!-- prettier-ignore-end -->

Along with its stylesheet:

<!-- prettier-ignore-start -->
```css
.app__portraitAvatar {
  border-radius: 4px;
}
```
<!-- prettier-ignore-end -->

Lastly, modify the middleware to use the new `<PortraitAvatar>`:

```diff
  const avatarMiddleware = () => next => ({ fromUser, ...otherArgs }) => {
-   const renderAvatar = next({ fromUser, ...otherArgs });
-
-   return (
-     renderAvatar &&
-     (() => (
-       <AvatarWithOnlineStatus onlineStatus="online">
-         {renderAvatar()}
-       </AvatarWithOnlineStatus>
-     ))
+   return () => (
+     <AvatarWithOnlineStatus onlineStatus="online">
+       <PortraitAvatar fromUser={fromUser} />
+     </AvatarWithOnlineStatus>
    );
  };
```

## Completed code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Customizable avatar</title>
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

      .app__avatarWithOnlineStatus {
        display: flex;
        position: relative;
      }

      .app__avatarWithOnlineStatus .app__avatarWithOnlineStatus__status {
        background-color: White;
        border-radius: 50%;
        border: solid 2px White;
        bottom: -2px;
        height: 10px;
        position: absolute;
        transition: background-color 200ms;
        width: 10px;
      }

      .app__avatarWithOnlineStatus:not(.app__avatarWithOnlineStatus--rtl) .app__avatarWithOnlineStatus__status {
        right: -2px;
      }

      .app__avatarWithOnlineStatus.app__avatarWithOnlineStatus--rtl .app__avatarWithOnlineStatus__status {
        left: -2px;
      }

      .app__avatarWithOnlineStatus .app__avatarWithOnlineStatus__status.app__avatarWithOnlineStatus__status--online {
        background-color: #090;
      }

      .app__avatarWithOnlineStatus .app__avatarWithOnlineStatus__status.app__avatarWithOnlineStatus__status--busy {
        background-color: Red;
      }

      .app__portraitAvatar {
        border-radius: 4px;
      }
    </style>
  </head>

  <body>
    <div id="webchat" role="main"></div>
    <script type="text/babel" data-presets="es2015,react,stage-3">
      (async function() {

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();
        const { useMemo } = window.React;
        const {
          ReactWebChat,
          hooks: { useDirection }
        } = window.WebChat;

        const AvatarWithOnlineStatus = ({ children, onlineStatus }) => {
          const [direction] = useDirection();

          return (
            <div
              className={`app__avatarWithOnlineStatus${direction === 'rtl' ? ' app__avatarWithOnlineStatus--rtl' : ''}`}
            >
              {children}
              {onlineStatus && (
                <div
                  className={`app__avatarWithOnlineStatus__status app__avatarWithOnlineStatus__status--${onlineStatus}`}
                />
              )}
            </div>
          );
        };

        const PortraitAvatar = ({ fromUser }) => {
          return <img className="app__portraitAvatar" src={fromUser ? 'user.jpg' : 'bot.jpg'} />;
        };

        const avatarMiddleware = () => next => ({ fromUser, ...otherArgs }) => {
          const renderAvatar = next({ fromUser, ...otherArgs });

          return () => (
            <AvatarWithOnlineStatus onlineStatus="online">
              <PortraitAvatar fromUser={fromUser} />
            </AvatarWithOnlineStatus>
          );
        };

        window.ReactDOM.render(
          <ReactWebChat
            avatarMiddleware={avatarMiddleware}
            directLine={window.WebChat.createDirectLine({ token })}
            styleOptions={{ botAvatarInitials: 'WC', userAvatarInitials: 'WW' }}
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

[Comprehensive live demo for customizable avatar](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/k.per-message-avatar/comprehensive.html)

[Demonstrates how to display initials for both Web Chat participants](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/02.branding-styling-and-customization/c.display-sender-initials)

[Demonstrates how to display images and initials for both Web Chat participants](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/02.branding-styling-and-customization/d.display-sender-images)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
