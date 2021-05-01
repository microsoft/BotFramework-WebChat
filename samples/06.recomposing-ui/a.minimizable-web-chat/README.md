# Sample - Customize Web Chat by Making the Component Minimizable

## Description

A web page where instead of Web Chat being the primary app, the Web Chat component is nested in a minimizable area of the DOM. This is a popular feature for Web Chat users, where the bot is an accessory to the website, not the main feature.

This app is built with `create-react-app`. If you have not used this package before, check out the [further reading](#further-reading) section before you get started.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/06.recomposing-ui/a.minimizable-web-chat)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/06.recomposing-ui/a.minimizable-web-chat` in command line
-  Run `npm install`
-  Run `npm start`
-  Browse to [http://localhost:3000/](http://localhost:3000/)

# Things to try out

-  Type `card bingsports` and notice the Adaptive Card
-  Minimize the Web Chat component by clicking the minimize button Web Chat header
-  Click the Web Chat button to toggle Web Chat (visually, this is the blue button on the bottom right side of the page)
-  Note that conversation state is preserved

# Reconnecting to a conversation

While this sample shows how to preserve state, this code does not include reconnecting to a conversation. To find out more, see the [further reading](#further-reading) section below.

# Code

> Jump to [completed code](#completed-code) to see the end-result `App.js`, `MinimizableWebChat.js`, and `WebChat.js`.

## Overview

This sample is the first of the 'advanced' tutorials, where Web Chat evolves beyond a single `index.html`. We will be using the node package manager, and installing several dependencies into an app that is made up of multiple files.

> Please note that while this sample does have `.css` files, they will not be discussed in this overview, though the `jsx` code snippets will include class names for reference purposes.

First let's set up the project.

```sh
cd C:\Users\You\Documents
npx create-react-app06.recomposing-ui/a.minimizable-web-chat
cd06.recomposing-ui/a.minimizable-web-chat
npm i botframework-webchat
```

Note that once `create-react-app` finishes running, you should have the following directories and files:

```sh
.git
node_modules
public
src
.gitignore
package.json
README.md
yarn.lock
```

> The `build` directory will also be visible if you are referencing the project within your local Web Chat repo.

Your source code will be located inside the `src` directory. When `npm start` is run, your app will be served out of the `public` directory.

Create the following files in `src`:

```sh
MinimizableWebChat.js
WebChat.js
```

Open the project in your preferred IDE.

First we will render Web Chat. To test, you can temporarily add `<WebChat>` to your `App.js`

In the `WebChat.js` file, import `React`, `{ useEffect, useMemo }` `ReactWebChat`, `createDirectLine`, and `createStyleSet` from our packages.

<!-- prettier-ignore-start -->
```js
import React from 'react';
import ReactWebChat, { createDirectLine, createStyleSet } from 'botframework-webchat';
```
<!-- prettier-ignore-end -->

Set up the functional component the same way you would set up a regular `React.Component`

1. Set state with `useMemo` and `createDirectLine` with your token. It is **never recommended** to put the Direct Line secret in the browser or client app. To learn more about secrets and tokens for Direct Line, visit this [tutorial on authentication](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication).
1. Inside render, be sure to return the `<ReactWebChat>` component.

<!-- prettier-ignore-start -->
```js
const WebChat = ({ className, onFetchToken, store, token }) => {
  const directLine = useMemo(() => createDirectLine({ token }), [token]);

  useEffect(() => {
    onFetchToken();
  }, [onFetchToken]);

  return token ? (
    <ReactWebChat className={`${className || ''} web-chat`} directLine={directLine} store={store} styleSet={styleSet} />
  ) : (
    <div className={`${className || ''} connect-spinner`}>
      <div className="content">
        <div className="icon">
          <span className="ms-Icon ms-Icon--Robot" />
        </div>
        <p>Please wait while we are connecting.</p>
      </div>
    </div>
  );
};
```
<!-- prettier-ignore-end -->

In the `useEffect` hook, invoke `onFetchToken` from props if the `token` has not been passed from the parent component.

<!-- prettier-ignore-start -->
```js
  useEffect(() => {
    onFetchToken();
  }, [onFetchToken]);

```
<!-- prettier-ignore-end -->

> Note: `onFetchToken()` is a method that will be implemented in `MinimizableWebChat.js`.

Let's move on to building the `<MinimizableWebChat>` component.

Import `React`, `{ useCallback, useMemo, useState }` `createStore`, and `createStyleSet`. Then import your newly made component, `WebChat`.

<!-- prettier-ignore-start -->
```js
import React from 'react', { useCallback, useMemo, useState };
import { createStore, createStyleSet } from 'botframework-webchat';

import WebChat from './WebChat';
```
<!-- prettier-ignore-end -->

1. Build the component in the return statement
   1. Depending on whether it is minimized, the ternary statement will switch between two different renders: minimized and maximized
   1. Render the `<WebChat>` component when the state is not minimized
   1. Create a header for the <WebChat> container with two buttons: one to switch sides of the window and the other to minimize the component

<!-- prettier-ignore-start -->
```js
   return (
    <div className="minimizable-web-chat">
      {minimized && (
        <button className="maximize">
          <span className={token ? 'ms-Icon ms-Icon--MessageFill' : 'ms-Icon ms-Icon--Message'} />
          {newMessage && <span className="ms-Icon ms-Icon--CircleShapeSolid red-dot" />}
        </button>
      )}
      {loaded && (
        <div className={classNames(side === 'left' ? 'chat-box left' : 'chat-box right', minimized ? 'hide' : '')}>
          <header>
            <div className="filler" />
            <button className="switch">
              <span className="ms-Icon ms-Icon--Switch" />
            </button>
            <button className="minimize">
              <span className="ms-Icon ms-Icon--ChromeMinimize" />
            </button>
          </header>
          <WebChat/>
        </div>
      )}
    </div>
  );
```
<!-- prettier-ignore-end -->

1. Create the component handling and state:
1. With `useState`, create the state tracking variables. It should track the following:
   -  If the chat is minimized
   -  If there are new messages
   -  Which side of the window the chat should display on
   -  The store
   -  The bot token, if fetched
1. With `useMemo`, create the store with `createStore()`
1. If the role of incoming activities is `'bot'`, set the state `newMessage: true`. This will be used to indicate when new messages have arrived to the bot when the chat is minimized
1. Create and set default state

<!-- prettier-ignore-start -->
```js
  const store = useMemo(
    () =>
      createStore({}, ({ dispatch }) => next => action => {
        if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
          dispatch({
            type: 'WEB_CHAT/SEND_EVENT',
            payload: {
              name: 'webchat/join',
              value: {
                language: window.navigator.language
              }
            }
          });
        } else if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
          if (action.payload.activity.from.role === 'bot') {
            setNewMessage(true);
          }
        }

        return next(action);
      }),
    []
  );

  const styleSet = useMemo(
    () =>
      createStyleSet({
        backgroundColor: 'Transparent'
      }),
    []
  );

  const [loaded, setLoaded] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const [newMessage, setNewMessage] = useState(false);
  const [side, setSide] = useState('right');
  const [token, setToken] = useState();
```
<!-- prettier-ignore-end -->

Next, let's build the helper functions. Those are:

<!-- prettier-ignore-start -->
```js
handleFetchToken; // Fetch token from the server. This will happen when Web Chat is rendered
handleMaximizeButtonClick; // Maximize Web Chat when button is clicked
handleMinimizeButtonClick; // Minimize Web Chat when button is clicked
handleSwitchButtonClick; // Toggle between left and right side of the screen when button is clicked
```
<!-- prettier-ignore-end -->

Now implement each method:

<!-- prettier-ignore-start -->
```js
  const handleFetchToken = useCallback(async () => {
    if (!token) {
      const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
      const { token } = await res.json();

      setToken(token);
    }
  }, [setToken, token]);

  const handleMaximizeButtonClick = useCallback(async () => {
    setLoaded(true);
    setMinimized(false);
    setNewMessage(false);
  }, [setMinimized, setNewMessage]);

  const handleMinimizeButtonClick = useCallback(() => {
    setMinimized(true);
    setNewMessage(false);
  }, [setMinimized, setNewMessage]);

  const handleSwitchButtonClick = useCallback(() => {
    setSide(side === 'left' ? 'right' : 'left');
  }, [setSide, side]);
```
<!-- prettier-ignore-end -->

Then implement these methods into the component:

```diff
  return (
    <div className="minimizable-web-chat">
      {minimized && (
        <button className="maximize"
+       onClick={handleMaximizeButtonClick}>
          <span className={token ? 'ms-Icon ms-Icon--MessageFill' : 'ms-Icon ms-Icon--Message'} />
          {newMessage && <span className="ms-Icon ms-Icon--CircleShapeSolid red-dot" />}
        </button>
      )}
      {loaded && (
        <div className={classNames(side === 'left' ? 'chat-box left' : 'chat-box right', minimized ? 'hide' : '')}>
          <header>
            <div className="filler" />
            <button className="switch"
+           onClick={handleSwitchButtonClick}>
              <span className="ms-Icon ms-Icon--Switch" />
            </button>
            <button className="minimize"
+           onClick={handleMinimizeButtonClick}>
              <span className="ms-Icon ms-Icon--ChromeMinimize" />
            </button>
          </header>
          <WebChat
            className="react-web-chat"
+           onFetchToken={handleFetchToken}
+           store={store}
            styleSet={styleSet}
+           token={token}
          />
        </div>
      )}
    </div>
  );
```

Let's move on to rendering the `<MinimizableWebChat>` component.

In `App.js`, do the following:

1. Delete lines ~9-22.
1. Replace the deleted code with the component we built, `<MinimizableWebChat>`

## Completed Code

Completed `App.js`: Note that the image `WebPageBackground` is a placeholder for the main app.

```diff
import React, { Component } from 'react';
import MinimizableWebChat from './MinimizableWebChat';

import WebPageBackground from './WebPage.jpg';
import './App.css';

class App extends Component {
  render() {
    return (
+     <div className="App">
        <img alt="product background" src={ WebPageBackground } />
+       <MinimizableWebChat />
+     </div>
   );
  }
}

export default App;
```

Completed `MinimizableWebChat.js`

<!-- prettier-ignore-start -->
```js
import classNames from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import { createStore, createStyleSet } from 'botframework-webchat';

import WebChat from './WebChat';

import './fabric-icons-inline.css';
import './MinimizableWebChat.css';

const MinimizableWebChat = () => {
  const store = useMemo(
    () =>
      createStore({}, ({ dispatch }) => next => action => {
        if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
          dispatch({
            type: 'WEB_CHAT/SEND_EVENT',
            payload: {
              name: 'webchat/join',
              value: {
                language: window.navigator.language
              }
            }
          });
        } else if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
          if (action.payload.activity.from.role === 'bot') {
            setNewMessage(true);
          }
        }

        return next(action);
      }),
    []
  );

  const styleSet = useMemo(
    () =>
      createStyleSet({
        backgroundColor: 'Transparent'
      }),
    []
  );

  const [loaded, setLoaded] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const [newMessage, setNewMessage] = useState(false);
  const [side, setSide] = useState('right');
  const [token, setToken] = useState();

  const handleFetchToken = useCallback(async () => {
    let token;

    if (!token) {
      const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
      const { token } = await res.json();

      setToken(token);
    }
  }, [setToken, token]);

  const handleMaximizeButtonClick = useCallback(async () => {
    setLoaded(true);
    setMinimized(false);
    setNewMessage(false);
  }, [setMinimized, setNewMessage]);

  const handleMinimizeButtonClick = useCallback(() => {
    setMinimized(true);
    setNewMessage(false);
  }, [setMinimized, setNewMessage]);

  const handleSwitchButtonClick = useCallback(() => {
    setSide(side === 'left' ? 'right' : 'left');
  }, [setSide, side]);

  return (
    <div className="minimizable-web-chat">
      {minimized && (
        <button className="maximize" onClick={handleMaximizeButtonClick}>
          <span className={token ? 'ms-Icon ms-Icon--MessageFill' : 'ms-Icon ms-Icon--Message'} />
          {newMessage && <span className="ms-Icon ms-Icon--CircleShapeSolid red-dot" />}
        </button>
      )}
      {loaded && (
        <div className={classNames(side === 'left' ? 'chat-box left' : 'chat-box right', minimized ? 'hide' : '')}>
          <header>
            <div className="filler" />
            <button className="switch" onClick={handleSwitchButtonClick}>
              <span className="ms-Icon ms-Icon--Switch" />
            </button>
            <button className="minimize" onClick={handleMinimizeButtonClick}>
              <span className="ms-Icon ms-Icon--ChromeMinimize" />
            </button>
          </header>
          <WebChat
            className="react-web-chat"
            onFetchToken={handleFetchToken}
            store={store}
            styleSet={styleSet}
            token={token}
          />
        </div>
      )}
    </div>
  );
};

export default MinimizableWebChat;

```
<!-- prettier-ignore-end -->

# Further reading

-  [`create-react-app` getting started](https://facebook.github.io/create-react-app/docs/getting-started)
-  [Composing Components in React](https://reactjs.org/docs/components-and-props.html#composing-components)
-  [Demystifying this.bind in React](https://hackernoon.com/demystifying-this-bind-in-react-87f1c843b8b7)
-  [Reconnect to a conversation documentation](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-reconnect-to-conversation?view=azure-bot-service-4.0)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples)
