# Sample - Change locale

This sample shows bot can send activity to change locale on Web Chat.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/22.customization-change-locale)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/22.customization-change-locale` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Type `echo ja-JP` to the bot
  -  You can also change to `en-US` and `zh-HK`

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview

> Note: this sample is based from [`03.a.host-with-react`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/03.a.host-with-react).

First, we will create a new `<App>` component that houses Web Chat, and render the `<App>` component.

```diff
+ const { createDirectLine, ReactWebChat } = window.WebChat;
+
+ const App = () => {
+   const directLine = useMemo(() => createDirectLine({ token }), []);
+
+   return (
+     <ReactWebChat directLine={directLine} />
+   );
+ };

  window.ReactDOM.render(
-   <ReactWebChat directLine={window.WebChat.createDirectLine({ token })} />,
+   <App />,
    document.getElementById('webchat')
  );
```

Then, we will add a locale to the `<App>` component, defaulting to browser's language.

```diff
  const { createDirectLine, ReactWebChat } = window.WebChat;

  const App = () => {
+   const [locale, setLocale] = useState(navigator.language);
    const directLine = useMemo(() => createDirectLine({ token }), []);

    return (
-     <ReactWebChat directLine={directLine} />
+     <ReactWebChat
+       directLine={directLine}
+       locale={locale}
+     />
    );
  };

  window.ReactDOM.render(
    <App />,
    document.getElementById('webchat')
  );
```

We will intercept all incoming activities. If the incoming activity is a message from the bot, and the content is a predefined locale, we will set the locale of Web Chat using the `setLocale` function.

```diff
  const { createDirectLine, ReactWebChat } = window.WebChat;

  const App = () => {
    const [locale, setLocale] = useState(navigator.language);
    const directLine = useMemo(() => createDirectLine({ token }), []);
+   const store = useMemo(() => createStore({}, () => next => action => {
+     if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
+       const { activity: { from: { role }, text, type } } = action.payload;
+
+       if (
+         (role === 'bot' && type === 'message') &&
+         (text === 'en-US' || text === 'ja-JP' || text === 'zh-HK')
+       ) {
+         setLocale(text);
+       }
+     }
+
+     return next(action);
+   }), []);

    return (
      <ReactWebChat
        directLine={directLine}
        locale={locale}
+       store={store}
      />
    );
  };

  window.ReactDOM.render(
    <App />,
    document.getElementById('webchat')
  );
```

## Completed code

Here is the finished `index.html`:

```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Change locale</title>

    <script src="https://unpkg.com/@babel/standalone@7.6.2/babel.min.js"></script>
    <script src="https://unpkg.com/react@16.8.6/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@16.8.6/umd/react-dom.development.js"></script>
    <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
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
      (async function () {

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();

        const { useMemo, useState } = window.React;
        const { createDirectLine, createStore, ReactWebChat } = window.WebChat;

        const App = () => {
          const [locale, setLocale] = useState(navigator.language);
          const directLine = useMemo(() => createDirectLine({ token }), []);
          const store = useMemo(() => createStore({}, () => next => action => {
            if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
              const { activity: { from: { role }, text, type } } = action.payload;

              if (
                (role === 'bot' && type === 'message') &&
                (text === 'en-US' || text === 'ja-JP' || text === 'zh-HK')
              ) {
                setLocale(text);
              }
            }

            return next(action);
          }), []);

          return (
            <ReactWebChat
              directLine={directLine}
              locale={locale}
              store={store}
            />
          );
        };

        window.ReactDOM.render(
          <App />,
          document.getElementById('webchat')
        );

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>
```

# Further reading

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
