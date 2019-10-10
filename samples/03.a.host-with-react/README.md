# Sample - Integrating Web Chat using React

> This is a great sample for first-time Web Chat users.

A simple web page with a maximized Web Chat and hosted using React. This sample makes changes that are based off of the [full-bundle CDN sample](./../01.a.getting-started-full-bundle/README.md).

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/03.a.host-with-react)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/03.a.host-with-react` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Type `help`: you should see a full list of MockBot features
-  Type `markdown`: you should see the sample of Markdown
-  Type `card weather`: you should see a weather card built using Adaptive Cards
-  Type `layout carousel`: you should see a carousel of cards
   -  Resize the window and see how the carousel change its size

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview

This sample has two main goals:

-  To import React and Babel standalone from [unpkg.com](https://unpkg.com/)
-  To render Web Chat via React component

We'll start by adding React and Babel to the head or our template, based off of the [full-bundle CDN sample](./../01.a.getting-started-full-bundle/README.md).

We will use standalone versions of Babel and React. In your production code, you should [setup Babel to precompile code](https://babeljs.io/en/setup/).

```diff
  <head>
+   <script src="https://unpkg.com/@babel/standalone@7.6.2/babel.min.js"></script>
+   <script src="https://unpkg.com/react@16.8.6/umd/react.development.js"></script>
+   <script src="https://unpkg.com/react-dom@16.8.6/umd/react-dom.development.js"></script>
    <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
  </head>
```

The core of this code both creates and renders the React component that displays Web Chat.

```diff
  (async function() {
    const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
    const { token } = await res.json();
+   const { createDirectLine, ReactWebChat } = window.WebChat;

-   window.WebChat.renderWebChat(
-     {
-       directLine: window.WebChat.createDirectLine({ token })
-     },
-     document.getElementById('webchat')
-   );
+   window.ReactDOM.render(
+     <ReactWebChat directLine={createDirectLine({ token })} />,
+     document.getElementById('webchat')
+   );
  })().catch(err => console.error(err));
```

## Completed code

Here is the finished `index.html`:

```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Integrate with React</title>
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
    <script type="text/babel">
      (async function () {
        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();
        const { createDirectLine, ReactWebChat } = window.WebChat;

        window.ReactDOM.render(
          <ReactWebChat directLine={createDirectLine({ token })} />,
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
