# Sample - Customize Web Chat by Making the Component Minimizable

## Description

A web page where instead of Web Chat being the primary app, the Web Chat component is nested in a minimizable area of the DOM. This is a popular feature for Web Chat users, where the bot is an accessory to the website, not the main feature.

This app is built with `create-react-app`. If you have not used this package before, check out the [further reading](#further-reading) section before you get started.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/12.customization-minimizable-web-chat)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/12.customization-minimizable-web-chat` in command line
-  Run `npm install`
-  Run `npm start`
-  Browse to [http://localhost:3000/](http://localhost:3000/)

# Things to try out

-  Type `card bingsports` and notice the Adaptive Card
-  Minimize the Web Chat component by clicking the minimize button Web Chat header
-  Click the Web Chat button to toggle Web Chat (visually, this is the blue button on the bottom right side of the page)
-  Note that conversation state is preserved

# Code

> Jump to [completed code](#completed-code) to see the end-result `App.js`, `MinimizableWebChat.js`, and `WebChat.js`.

## Overview

This sample is the first of the 'advanced' tutorials, where Web Chat evolves beyond a single `index.html`. We will be using the node package manager, and installing several dependencies into an app that is made up of multiple files.

> Please note that while this sample does have `.css` files, they will not be discussed in this overview, though the `jsx` code snippets will include class names for reference purposes.

First let's set up the project.

```sh
cd C:\Users\You\Documents
npx create-react-app 12.customization-minimizable-web-chat
cd 12.customization-minimizable-web-chat
npm i botframework-webchat memoize-one
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

In the `WebChat.js` file, import `memoize`, `React`, `ReactWebChat`, `createDirectLine`, and `createStyleSet` from our packages.

```jsx
import memoize from 'memoize-one';
import React from 'react';
import ReactWebChat, { createDirectLine, createStyleSet } from 'botframework-webchat';
```

Set up the component the same way you would set up a regular `React.Component`

1. Create the `constructor()` and `render()` methods.
1. In the constructor you can set state and `createDirectLine` with your token. It is **never recommended** to put the Direct Line secret in the browser or client app. To learn more about secrets and tokens for Direct Line, visit this [tutorial on authentication](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication).
1. Inside render, be sure to return the `<ReactWebChat>` component.

```jsx
constructor(props) {
  super(props);

  this.createDirectLine = memoize(token => createDirectLine({ token }));

  this.state = {
    styleSet: createStyleSet({
      backgroundColor: 'Transparent'
    })
  };
}

  render() {
    const {
      props: { className, store, token },
      state: { styleSet }
    } = this;

    return (
      <ReactWebChat
        className={ `${ className || '' } web-chat` }
        directLine={ this.createDirectLine(token) }
        store={ store }
        styleSet={ styleSet }
      />
    );
  }
```

Create the React method `componentDidMount` and invoke `onFetchToken` from props if the `token` has not been passed from the parent component.

```jsx
componentDidMount() {
  !this.props.token && this.props.onFetchToken();
}
```

> Note: `onFetchToken()` is a method that will be implemented in `MinimizableWebChat.js`.

Let's move on to building the `<MinimizableWebChat>` component.

Import `React`, `createStore`, and `createStyleSet`. Then import your newly made component, `WebChat`.

```jsx
import React from 'react';
import { createStore, createStyleSet } from 'botframework-webchat';

import WebChat from './WebChat';
```

1. Create the `render()` method
   1. Create the state object. It should track the following:
      -  If the chat is minimized
      -  If there are new messages
      -  Which side of the window the chat should display on
      -  The store
      -  The bot token, if fetched
   1. Build the component in the return statement
      1. Depending on whether it is minimized, the ternary statement will switch between two different renders: minimized and maximized
      1. Render the `<WebChat>` component when the state is not minimized
      1. Create a header for the <WebChat> container with two buttons: one to switch sides of the window and the other to minimize the component

```jsx
render() {
  const { state: {
    minimized,
    newMessage,
    side,
    store,
    styleSet,
    token
  } } = this;

  return (
    <div className="minimizable-web-chat">
      {
        minimized ?
          <button
            className="maximize"
            // toggle minimized state
          >
            <span className={ token ? 'ms-Icon ms-Icon--MessageFill' : 'ms-Icon ms-Icon--Message' } />
            {
              newMessage &&
                <span className="ms-Icon ms-Icon--CircleShapeSolid red-dot" />
            }
          </button>
        :
          <div
            className={ side === 'left' ? 'chat-box left' : 'chat-box right' }
          >
            <header>
              <div className="filler" />
              <button
                className="switch"
                // toggle whether the chat is on the left or right
              >
                <span className="ms-Icon ms-Icon--Switch" />
              </button>
              <button
                className="minimize"
                // toggle minimized state
              >
                <span className="ms-Icon ms-Icon--ChromeMinimize" />
              </button>
            </header>
            <WebChat
              className="react-web-chat"
              store={ store }
              styleSet={ styleSet }
              token={ token }
            />
          </div>
      }
    </div>
  );
}
```

1. Create the `constructor()`
   1. In the constructor, create the store with `createStore()`
   1. If the role of incoming activities is `'bot'`, set the state `newMessage: true`. This will be used to indicate when new messages have arrived to the bot when the chat is minimized
   1. Set the initial state.

```jsx
constructor(props) {
  super(props);

  const store = createStore({}, ({ dispatch }) => next => action => {
    if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
      if (action.payload.activity.from.role === 'bot') {
        this.setState(() => ({ newMessage: true }));
      }
    }

    return next(action);
  });

  this.state = {
    minimized: true,
    newMessage: false,
    side: 'right',
    store,
    styleSet: createStyleSet({
      backgroundColor: 'Transparent'
    }),
    token: null
  };
}
```

Next, let's build the helper functions. Those are:

```jsx
handleFetchToken; // Fetch token from the server. This will happen when Web Chat is rendered
handleMaximizeButtonClick; // Maximize Web Chat when button is clicked
handleMinimizeButtonClick; // Minimize Web Chat when button is clicked
handleSwitchButtonClick; // Toggle between left and right side of the screen when button is clicked
```

In the constructor, use `.bind()` to bind the methods to `this`

```diff
constructor(props) {
  super(props);

+ this.handleFetchToken = this.handleFetchToken.bind(this);
+ this.handleMaximizeButtonClick = this.handleMaximizeButtonClick.bind(this);
+ this.handleMinimizeButtonClick = this.handleMinimizeButtonClick.bind(this);
+ this.handleSwitchButtonClick = this.handleSwitchButtonClick.bind(this);
…
```

Now we will implement each method:

```js
async handleFetchToken() {
  if (!this.state.token) {
    const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
    const { token } = await res.json();

    this.setState(() => ({ token }));
  }
}

handleMaximizeButtonClick() {
  this.setState(() => ({
    minimized: false,
    newMessage: false
  }));
}

handleMinimizeButtonClick() {
  this.setState(() => ({
    minimized: true,
    newMessage: false
  }));
}

handleSwitchButtonClick() {
  this.setState(({ side }) => ({
    side: side === 'left' ? 'right' : 'left'
  }));
}
```

Then implement these methods into the component:

```diff
render() {
  const { state: {
    minimized,
    newMessage,
    side,
    store,
    styleSet,
    token
  } } = this;

  return (
    <div className="minimizable-web-chat">
      {
        minimized ?
          <button
            className="maximize"
+           onClick={ this.handleMaximizeButtonClick }
          >
            <span className={ token ? 'ms-Icon ms-Icon--MessageFill' : 'ms-Icon ms-Icon--Message' } />
            {
              newMessage &&
                <span className="ms-Icon ms-Icon--CircleShapeSolid red-dot" />
            }
          </button>
        :
          <div
            className={ side === 'left' ? 'chat-box left' : 'chat-box right' }
          >
            <header>
              <div className="filler" />
              <button
                className="switch"
+               onClick={ this.handleSwitchButtonClick }
              >
                <span className="ms-Icon ms-Icon--Switch" />
              </button>
              <button
                className="minimize"
+               onClick={ this.handleMinimizeButtonClick }
              >
                <span className="ms-Icon ms-Icon--ChromeMinimize" />
              </button>
            </header>
            <WebChat
              className="react-web-chat"
+             onFetchToken={ this.handleFetchToken }
              store={ store }
              styleSet={ styleSet }
              token={ token }
            />
          </div>
      }
    </div>
  );
}

```

Let's move on to rendering the `<MinimizableWebChat>` component.

In `App.js`, do the following:

1. Delete lines ~9-22.
1. Replace the deleted code with the component we built, `<MinimizableWebChat>`

## Completed Code

Completed `App.js`: Note that the image `WebPageBackground` is a placeholder for the app.

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

```jsx
import React from 'react';
import { createStore, createStyleSet } from 'botframework-webchat';

import WebChat from './WebChat';

import './fabric-icons-inline.css';
import './MinimizableWebChat.css';

export default class extends React.Component {
   constructor(props) {
      super(props);

      this.handleFetchToken = this.handleFetchToken.bind(this);
      this.handleMaximizeButtonClick = this.handleMaximizeButtonClick.bind(this);
      this.handleMinimizeButtonClick = this.handleMinimizeButtonClick.bind(this);
      this.handleSwitchButtonClick = this.handleSwitchButtonClick.bind(this);

      const store = createStore({}, ({ dispatch }) => next => action => {
         if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
            if (action.payload.activity.from.role === 'bot') {
               this.setState(() => ({ newMessage: true }));
            }
         }

         return next(action);
      });

      this.state = {
         minimized: true,
         newMessage: false,
         side: 'right',
         store,
         styleSet: createStyleSet({
            backgroundColor: 'Transparent'
         }),
         token: null
      };
   }

   async handleFetchToken() {
      if (!this.state.token) {
         const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
         const { token } = await res.json();

         this.setState(() => ({ token }));
      }
   }

   handleMaximizeButtonClick() {
      this.setState(() => ({
         minimized: false,
         newMessage: false
      }));
   }

   handleMinimizeButtonClick() {
      this.setState(() => ({
         minimized: true,
         newMessage: false
      }));
   }

   handleSwitchButtonClick() {
      this.setState(({ side }) => ({
         side: side === 'left' ? 'right' : 'left'
      }));
   }

   render() {
      const {
         state: { minimized, newMessage, side, store, styleSet, token }
      } = this;

      return (
         <div className="minimizable-web-chat">
            {minimized ? (
               <button className="maximize" onClick={this.handleMaximizeButtonClick}>
                  <span className={token ? 'ms-Icon ms-Icon--MessageFill' : 'ms-Icon ms-Icon--Message'} />
                  {newMessage && <span className="ms-Icon ms-Icon--CircleShapeSolid red-dot" />}
               </button>
            ) : (
               <div className={side === 'left' ? 'chat-box left' : 'chat-box right'}>
                  <header>
                     <div className="filler" />
                     <button className="switch" onClick={this.handleSwitchButtonClick}>
                        <span className="ms-Icon ms-Icon--Switch" />
                     </button>
                     <button className="minimize" onClick={this.handleMinimizeButtonClick}>
                        <span className="ms-Icon ms-Icon--ChromeMinimize" />
                     </button>
                  </header>
                  <WebChat
                     className="react-web-chat"
                     onFetchToken={this.handleFetchToken}
                     store={store}
                     styleSet={styleSet}
                     token={token}
                  />
               </div>
            )}
         </div>
      );
   }
}
```

Completed `WebChat.js`

```jsx
import memoize from 'memoize-one';
import React from 'react';
import ReactWebChat, { createDirectLine, createStyleSet } from 'botframework-webchat';

import './WebChat.css';

export default class extends React.Component {
   constructor(props) {
      super(props);

      this.createDirectLine = memoize(token => createDirectLine({ token }));

      this.state = {
         styleSet: createStyleSet({
            backgroundColor: 'Transparent'
         })
      };
   }

   componentDidMount() {
      !this.props.token && this.props.onFetchToken();
   }

   render() {
      const {
         props: { className, store, token },
         state: { styleSet }
      } = this;

      return token ? (
         <ReactWebChat
            className={`${className || ''} web-chat`}
            directLine={this.createDirectLine(token)}
            store={store}
            styleSet={styleSet}
         />
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
   }
}
```

# Further reading

-  [`create-react-app` getting started](https://facebook.github.io/create-react-app/docs/getting-started)
-  [Composing Components in React](https://reactjs.org/docs/components-and-props.html#composing-components)
-  [Demystifying this.bind in React](https://hackernoon.com/demystifying-this-bind-in-react-87f1c843b8b7)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
