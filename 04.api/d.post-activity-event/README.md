# Sample - Programmatic access to post activity

When the 'Help' button is clicked, an activity will be sent programmatically to the bot.

> 2020-06-17: This sample is updated to use composition mode and [Web Chat hooks API](https://github.com/microsoft/BotFramework-WebChat/blob/master/docs/HOOKS.md). This API has better documentation and geared towards user stories involving UI.

# Test out the hosted sample

![Demo](https://raw.githubusercontent.com/microsoft/BotFramework-WebChat/master/samples/04.api/d.post-activity-event/demo.gif)

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/04.api/d.post-activity-event)

# Things to try out

-  Click the "Help" button on upper-left hand corner

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

This sample is based on the [04.api/m.enable-composition-mode](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/04.api/m.enable-composition-mode) sample.

# Overview

## Add a button to send "help" command on click

### Create a React component with the button

First, a new React component is created with the button. When clicked, [`useSendMessage`](https://github.com/microsoft/BotFramework-WebChat/blob/master/docs/HOOKS.md#usesendmessage) hook will send a text string `"help"` to the bot.

```js
const SendHelpMessageButton = () => {
   const sendMessage = useSendMessage();

   const handleHelpButtonClick = useCallback(() => sendMessage('help'), [sendMessage]);

   return (
      <button className="help-button" onClick={handleHelpButtonClick} type="button">
         Send "help" to the bot
      </button>
   );
};
```

### Add a CSS style sheet

Then, a CSS style sheet is added to put the button on top left corner of the page.

```diff
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

+   .help-button {
+     left: 10px;
+     position: absolute;
+     top: 10px;
+   }
  </style>
```

### Add the React component to the API container

Lastly, the React component is added to the API container.

```diff
  ReactDOM.render(
    <Composer directLine={directLine}>
      <BasicWebChat />
+     <SendHelpMessageButton />
    </Composer>,
    document.getElementById('webchat')
  );
```

## Completed Code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Programmatic access to post activity</title>
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

      .app__help-button {
        left: 10px;
        position: absolute;
        top: 10px;
      }
    </style>
  </head>
  <body>
    <div id="webchat" role="main"></div>
    <script type="text/babel" data-presets="env,stage-3,react">
      (async function() {
        const {
          React: { useCallback, useEffect },
          WebChat: {
            Components: { BasicWebChat, Composer },
            createDirectLine,
            hooks: { useFocus, useSendMessage }
          }
        } = window;

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();
        const directLine = createDirectLine({ token });

        const SendHelpMessageButton = () => {
          const sendMessage = useSendMessage();

          const handleHelpButtonClick = useCallback(() => sendMessage('help'), [sendMessage]);

          return (
            <button className="app__help-button" onClick={handleHelpButtonClick} type="button">
              Send "help" to the bot
            </button>
          );
        };

        ReactDOM.render(
          <Composer directLine={directLine}>
            <BasicWebChat />
            <SendHelpMessageButton />
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

[`04.api/c.incoming-activity-event`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/15.a.incoming-activity-event) is a sample that will fire JavaScript event on all incoming activities.

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
