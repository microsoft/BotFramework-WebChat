# Sample -  Integrating Web Chat using React

> This is a great sample for first-time Web Chat users.

A simple web page with a maximized Web Chat and hosted using React. This sample makes changes that are based off of the [full-bundle CDN sample](./../full-bundle/README.md).

# Test out the hosted sample

- [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/03.a.host-with-react)

# How to run locally

- Fork this repository
- Navigate to `/Your-Local-WebChat/samples/03.a.host-with-react` in command line
- Run `npx serve`
- Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

- Type `help`: you should see a full list of MockBot features
- Type `markdown`: you should see the sample of Markdown
- Type `card weather`: you should see a weather card built using Adaptive Cards
- Type `layout carousel`: you should see a carousel of cards
   - Resize the window and see how the carousel change its size

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Goals of this bot

The `index.html` page has two main goals.

- To import React and Babel from [unpkg.com](https://unpkg.com/)
- To render Web Chat via React component

We'll start by adding React and Babel to the head our template, based off of the [full-bundle CDN sample](./../full-bundle/README.md).

```diff
…
<head>
+ <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
+ <script src="https://unpkg.com/react@16.5.0/umd/react.development.js"></script>
+ <script src="https://unpkg.com/react-dom@16.5.0/umd/react-dom.development.js"></script>
+ <script src="https://unpkg.com/react-redux@5.0.7/dist/react-redux.min.js"></script>
  <script src="https://cdn.botframework.com/botframework-webchat/master/webchat.js"></script>
</head>
…
```

> For demonstration purposes, we are using the development branch of Web Chat at "/master/webchat.js". When you are using Web Chat for production, you should use the latest stable release at "/latest/webchat.js", or lock down on a specific version with the following format: "/4.1.0/webchat.js".

The core of this code both creates and renders the React component that displays Web Chat.

```js
…
const { createStore, ReactWebChat } = window.WebChat;
const { Provider } = window.ReactRedux;
const store = createStore();

window.ReactDOM.render(
  <ReactWebChat
    directLine={ window.WebChat.createDirectLine({ token }) }
  />,
  document.getElementById('webchat')
);
…
```

In our design, we believe we should allow developers to bring in their own version of backend with the Web Chat UI. Therefore, the backend (i.e. Redux facility) can be used separately from the UI (i.e. React component).

When instantiating Web Chat using React, one would need to use [`react-redux/Provider`](https://github.com/reduxjs/react-redux/blob/master/docs/api.md#provider-store) to connect them together.

## Completed code

Here is the finished `index.html`:

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Integrate with React</title>
+   <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
+   <script src="https://unpkg.com/react@16.5.0/umd/react.development.js"></script>
+   <script src="https://unpkg.com/react-dom@16.5.0/umd/react-dom.development.js"></script>
+   <script src="https://unpkg.com/react-redux@5.0.7/dist/react-redux.min.js"></script>
    <script src="https://cdn.botframework.com/botframework-webchat/master/webchat.js"></script>
    <style>
      html, body { height: 100% }
      body { margin: 0 }
      #webchat, #webchat > * {
        height: 100%;
        width: 100%;
      }
    </style>
  </head>
    <div id="webchat" role="main"></div>
-   <script>
+   <script type="text/babel">
      (async function () {
        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();
+       const { createStore, ReactWebChat } = window.WebChat;
+       const { createProvider } = window.ReactRedux;
+       const Provider = createProvider('webchat');
+       const store = createStore();

-       window.WebChat.renderWebChat({
+       window.ReactDOM.render(
+         <Provider store={ store }>
+           <ReactWebChat
              directLine={ window.WebChat.createDirectLine({ token }) }
+             storeKey="webchat"
+           />
-       }, document.getElementById('webchat'));
+         </Provider>,
+         document.getElementById('webchat')
+       );
        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>
```

# Further reading

## Full list of Web Chat hosted samples

View the list of available samples by clicking [here](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples)
