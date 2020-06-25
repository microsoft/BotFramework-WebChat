# Sample - Enable composition mode

This sample shows how to enable composition mode.

Composition mode enables developers to use Web Chat APIs, such as the [Web Chat hooks API](https://github.com/microsoft/BotFramework-WebChat/blob/master/docs/HOOKS.md), in areas outside of the conventional UI. For example, developers can hide the built-in send box UI and create a new send box from scratch.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/04.api/m.enable-composition-mode)

# Things to try out

-  Use [Web Chat hooks API](https://github.com/microsoft/BotFramework-WebChat/blob/master/docs/HOOKS.md) in the API container.

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

This sample is based on the [01.getting-started/e.host-with-react](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/e.host-with-react) sample.

## Enable composition mode

`<ReactWebChat>` is the conventional entrypoint for the chat experience. In fact, [`<ReactWebChat>`](https://github.com/microsoft/BotFramework-WebChat/blob/master/packages/component/src/ReactWebChat.js) is a React component comprised from two components:

-  [`<Composer>`](https://github.com/microsoft/BotFramework-WebChat/blob/master/packages/component/src/Composer.js) is the API container. It is designed to be platform-neutral and enables Web Chat APIs for its descendants;
-  [`<BasicWebChat>`](https://github.com/microsoft/BotFramework-WebChat/blob/master/packages/component/src/BasicWebChat.js) is the conventional UI component. It consumes Web Chat APIs and render using HTML.

To enable composition mode, `<ReactWebChat>` will be replaced by `<Composer>` and `<BasicWebChat>`. All props previously passed to `<ReactWebChat>` will be passed to `<Composer>` instead.

```diff
  <script type="text/babel" data-presets="env,stage-3,react">
    (async function() {
      const {
        WebChat: {
-         createDirectLine,
-         ReactWebChat
+         Components: { BasicWebChat, Composer },
+         createDirectLine
        }
      } = window;

      const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
      const { token } = await res.json();

      ReactDOM.render(
-       <ReactWebChat directLine={createDirectLine({ token })} />,
+       <Composer directLine={createDirectLine({ token })}>
+         <BasicWebChat />
+       </Composer>,
        document.getElementById('webchat')
      );
    })().catch(err => console.error(err));
  </script>
```

## Send "help" on connect

To demonstrate the [Web Chat hooks API](https://github.com/microsoft/BotFramework-WebChat/blob/master/docs/HOOKS.md) in the API container, a headless component will be added to send "help" command on connect.

A new headless component `<SendHelpOnConnect>` will be added to the API container. When the value from [`useConnectivityStatus`](https://github.com/microsoft/BotFramework-WebChat/blob/master/docs/HOOKS.md#useconnectivitystatus) hook become `"connected"`, a "help" command will be sent using the [`useSendMessage`](https://github.com/microsoft/BotFramework-WebChat/blob/master/docs/HOOKS.md#usesendmessage) hook.

```diff
  <script type="text/babel" data-presets="env,stage-3,react">
    (async function() {
      const {
        WebChat: {
          createDirectLine,
-         Components: { BasicWebChat, Composer }
+         Components: { BasicWebChat, Composer },
+         hooks: { useConnectivityStatus, useSendMessage }
        }
      } = window;

      const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
      const { token } = await res.json();

+     const SendHelpOnConnect = () => {
+       const [connectivityStatus] = useConnectivityStatus();
+       const sendMessage = useSendMessage();
+
+       useEffect(() => {
+         connectivityStatus === 'connected' && sendMessage('help');
+       }, [connectivityStatus, sendMessage]);
+
+       return false;
+     };

      ReactDOM.render(
        <Composer directLine={createDirectLine({ token })}>
          <BasicWebChat />
+         <SendHelpOnConnect />
        </Composer>,
        document.getElementById('webchat')
      );
    })().catch(err => console.error(err));
  </script>
```

# Completed Code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Enable composition mode</title>
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
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
        height: 100%;
        margin: auto;
        max-width: 480px;
        min-width: 360px;
      }
    </style>
  </head>
  <body>
    <div id="webchat"></div>
    <script type="text/babel" data-presets="env,stage-3,react">
      (async function() {
        const {
          React: { useCallback, useEffect, useRef, useState },
          WebChat: {
            Components: { BasicWebChat, Composer },
            createDirectLine
          }
        } = window;

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();

        const SendHelpOnConnect = () => {
          const [connectivityStatus] = useConnectivityStatus();
          const sendMessage = useSendMessage();

          useEffect(() => {
            connectivityStatus === 'connected' && sendMessage('help');
          }, [connectivityStatus, sendMessage]);

          return false;
        };

        ReactDOM.render(
          <Composer directLine={window.WebChat.createDirectLine({ token })}>
            <BasicWebChat />
            <SendHelpOnConnect />
          </Composer>,
          document.getElementById('webchat')
        );
      })().catch(err => console.error(err));
    </script>
  </body>
</html>
```
<!-- prettier-ignore-end -->

# Further reading

-  [Web Chat hooks API](https://github.com/microsoft/BotFramework-WebChat/blob/master/docs/HOOKS.md)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
