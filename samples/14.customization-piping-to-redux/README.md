# Customize Web Chat by Using Middleware to Dispatch Incoming Activities

## Description

This app pipes Redux action activities via middleware to your Redux store. (This store is separate from Web Chat's Redux store). By selecting a suggested action in the bot, the user can affect the UI (background color) of Web Chat through the bot.

If you haven't viewed them already, review and understanding of samples 11 and 12 would be extremely beneficial for this sample, linked in [further reading](#further-reading).

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/14.customization-piping-to-redux)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/14.customization-piping-to-redux` in command line
-  Run `npm install`
-  Run `npm start`
-  Browse to [http://localhost:3000/](http://localhost:3000/)

# Things to try out

-  Type `sample:redux-middleware`
-  Select one of the suggested actions
-  Notice the background color of the bot changes

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.js` `App.js`, `WebChat.js`, and `dispatchIncomingActivityMiddleware`.

# Overview

For a general overview of the `App.js` and `WebChat.js` files in `src`, please review sample [12.customization-minimizable-web-chat](./../12.customization-minimizable-web-chat)

Part of our focus in this sample is on `dispatchIncomingActivityMiddleware`. This code is extremely similar to what we've seen in sample [11.customization-redux-actions](./../11.customization-redux-actions). The middleware we build will filter activities and dispatch to the app's store and dispatch these actions to the bot. Note that Mock Bot has the following actions available to make changes to the DOM:

```jsx
color = color.trim();

if (color) {
   const action = {
      type: 'SET_BACKGROUND_COLOR',
      payload: { color }
   };

   context.sendActivity({
      type: 'message',
      text: `Will send Redux action in another "message" activity.\n\n\`\`\`\n${JSON.stringify(
         action,
         null,
         2
      )}\n\`\`\`\n\nFeel free to let me know if you changed your mind.`,
      ...SUGGESTED_ACTIONS
   });
}
```

> This code adds the color that was sent to the action and then dispatches it, as well as sends a message from the bot to the user. This means that Web Chat must have a reducer that will set the color when the action is received.

Here is `dispatchIncomingActivityMiddleware` with differences from [11.customization-redux-actions](./../11.customization-redux-actions) highlighted:

```diff
export default function (dispatch) {
  return () => next => action => {
    if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
      const { activity } = action.payload;

      if (
+       activity.type === 'event'
+       && activity.from.role === 'bot'
+       && activity.name === 'redux action'
      ) {
+       dispatch(activity.value);
      }
    }

    return next(action);
  };
}

```

The next part of our focus is in the `redux` directory. Note that in `store.js`, we are building a new store with our additional reducer from `reducer.js`.

1. Import our new store from `'./redux/store'` and assign it in the `<Provider>` of `index.js` to make it available to our components in the app.
1. Add the backgroundColor and dispatch as properties to be sent to `<ReactWebChat>` via it's render in `App.js`
1. In WebChat.js, expand our store to handle the dispatch of redux activities by adding `dispatchIncomingActivityMiddleware`

## Completed Code

Below are the completed `.js` files, with the difference after create-react-app is run highlighted. Differences that were explained in `[12.customization-minimizable-web-chat](./../12.customization-minimizable-web-chat)` are ignored.

`index.js`:

```diff
import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

import App from './App';
import registerServiceWorker from './registerServiceWorker';
import store from './redux/store';

ReactDOM.render(
+ <Provider store={ store }>
    <App />
+ </Provider>,
  document.getElementById('root')
);

registerServiceWorker();

```

`App.js`:

```diff
import { connect } from 'react-redux';
import React from 'react';

import ReactWebChat from './WebChat';

class App extends React.Component {
  render() {
+   const { props: {
+     backgroundColor,
+     dispatch
+   } } = this;

    return (
+    <div id="app" style={{ backgroundColor }}>
+       <ReactWebChat appDispatch={ dispatch } />
+     </div>
    )
  }
}

export default connect(
+ ({ backgroundColor }) => ({ backgroundColor })
)(App)

```

`WebChat.js`:

```diff
import React from 'react';

import ReactWebChat, { createDirectLine, createStore } from 'botframework-webchat';
import dispatchIncomingActivityMiddleware from './dispatchIncomingActivityMiddleware';

export default class extends React.Component {
  constructor(props) {
    super(props);

+   this.store = createStore(
+     {},
+     dispatchIncomingActivityMiddleware(props.appDispatch)
+   );

    this.state = {};
  }

  componentDidMount() {
    this.fetchToken();
    this.setSendBox();
  }

  async fetchToken() {
    const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
    const { token } = await res.json();

    this.setState(() => ({
      directLine: createDirectLine({ token })
    }));
  }

  setSendBox() {
    this.store.dispatch({
      type: 'WEB_CHAT/SET_SEND_BOX',
      payload: { text: 'sample:redux-middleware' }
    });
  }

  render() {
    return (
      this.state.directLine ?
        <ReactWebChat
          className="chat"
+        directLine={ this.state.directLine }
+         store={ this.store }
+         styleOptions={{
+           backgroundColor: 'Transparent'
+         }}
        />
      :
        <div>Connecting to bot&hellip;</div>
    );
  }
}

```

Completed code for `dispatchIncomingActivityMiddleware.js`:

```js
export default function(dispatch) {
   return () => next => action => {
      if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
         const { activity } = action.payload;

         if (
            activity.type === 'event' &&
            activity.from.role === 'bot' &&
            activity.name === 'redux action'
         ) {
            dispatch(activity.value);
         }
      }

      return next(action);
   };
}
```

# Further reading

[Redux Documentation](https://redux.js.org/)

[Customization of Redux Actions bot](https://microsoft.github.io/BotFramework-WebChat/11.customization-redux-actions) | [Customization of Redux Actions source code](./../11.customization-redux-actions)

[Minimizable Web Chat bot ](https://microsoft.github.io/BotFramework-WebChat/12.customization-minimizable-web-chat) | [Minimizable Web Chat source code](./../12.customization-minimizable-web-chat)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples)
