# Sample - Clear Conversation After Idle

This sample shows how to replace Web Chat's store to clear the conversation.

> _Note: This is just a proof of concept thus should not be used in production
> and lacks security considerations._

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/04.api/h.clear-after-idle)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/04.api/h.clear-after-idle` in the command line
-  Run `npm install && npm run start` in the directory
-  Browse to [http://localhost:3000/](http://localhost:3000/)

# Things to try out

-  Send a message to the bot and let the timer expire - this will start a new conversation.
-  Send a message to the bot and send another one before the timer expires - this will keep the conversation active.

# Code

> Jump to [completed code](#completed-code) to see the end-result `App.js`, `useTimeoutAt.js`, `Countdown.js`, and `useInterval.js`.

## Overview

This sample demonstrates how to clear the conversation data and start a new conversation with the user after the conversation has sat idle for a set time.

To accomplish this, we created a state - `resetAt` - to indicate when we should reset the UI, in epoch time. Then, we created a custom hook - `useTimeoutAt` - that takes a callback as a parameter, which is called when the timer expires.

<!-- prettier-ignore-start -->
```js
import { useEffect } from 'react';

export default function useTimeoutAt(fn, at) {
  useEffect(() => {
    const timer = setTimeout(fn, Math.max(0, at - Date.now()));

    return () => clearTimeout(timer);
  }, [fn, at]);
}
```
<!-- prettier-ignore-end -->

We also created a custom store middleware that resets the timer by calling `setResetAt` with the default time interval when the user submits the send box, or when the connection established.

<!-- prettier-ignore-start -->
```js
setSession({
  directLine: createDirectLine({ token }),
  key,
  store: createStore({}, () => next => action => {
    if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED' || action.type === 'WEB_CHAT/SUBMIT_SEND_BOX') {
      // Reset the timer when the connection established, or the user sends an activity
      setResetAt(Date.now() + IDLE_TIMEOUT);
    }

    return next(action);
  })
});
```
<!-- prettier-ignore-end -->

If the user stops participating in the conversation and the timer expires, we will replace the store to clear the conversation data. However, when the store is replaced, Web Chat dispatches a `'DIRECT_LINE/DISCONNECT'`, so we also need to request a new token. The `initConversation` method handles both replacing the custom store and requesting a new Direct Line token to start a new conversation with the bot. This function is passed to the `useTimeoutAt` hook so the conversation will be restarted when the timer expires.

<!-- prettier-ignore-start -->
```js
const initConversation = useCallback(() => {
  setSession(false);

  (async function() {
    const token = await fetchToken();
    const key = Date.now();

    setSession({
      directLine: createDirectLine({ token }),
      key,
      store: createStore({}, () => next => action => {
        if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED' || action.type === 'WEB_CHAT/SUBMIT_SEND_BOX') {
          // Reset the timer when the connection established, or the user sends an activity
          setResetAt(Date.now() + IDLE_TIMEOUT);
        }

        return next(action);
      })
    });
  })();
}, [setResetAt, setSession]);

useTimeoutAt(initConversation, resetAt);
useEffect(initConversation, [initConversation]);
```
<!-- prettier-ignore-end -->

## Completed Code

Here is the finished `App.js`:

<!-- prettier-ignore-start -->
```js
import React, { useCallback, useEffect, useState } from 'react';
import ReactWebChat, { createDirectLine, createStore } from 'botframework-webchat';

import './App.css';
import Countdown from './Countdown';
import useTimeoutAt from './utils/useTimeoutAt';

const IDLE_TIMEOUT = 30000;

async function fetchToken() {
  const res = await fetch('https://webchat-mockbot2.azurewebsites.net/api/directline/token', { method: 'POST' });
  const { token } = await res.json();

  return token;
}

function App() {
  const [resetAt, setResetAt] = useState(() => Date.now() + IDLE_TIMEOUT);
  const [session, setSession] = useState();

  const initConversation = useCallback(() => {
    setSession(false);

    (async function() {
      const token = await fetchToken();
      const key = Date.now();

      setSession({
        directLine: createDirectLine({ token }),
        key,
        store: createStore({}, () => next => action => {
          if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED' || action.type === 'WEB_CHAT/SUBMIT_SEND_BOX') {
            setResetAt(Date.now() + IDLE_TIMEOUT);
          }

          return next(action);
        })
      });
    })();
  }, [setResetAt, setSession]);

  useTimeoutAt(initConversation, resetAt);
  useEffect(initConversation, [initConversation]);

  return (
    <div className="App">
      <Countdown to={resetAt} />
      {!!session && (
        <ReactWebChat className="chat" directLine={session.directLine} key={session.key} store={session.store} />
      )}
    </div>
  );
}

export default App;
```
<!-- prettier-ignore-end -->

# Further reading

-  [Hooks at a Glance](https://reactjs.org/docs/hooks-overview.html)
-  [Web Chat Back Channel Welcome Event Sample](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/04.api/a.welcome-event)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples)
