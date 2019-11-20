# Sample - Clear Conversation After Idle

This sample shows how to replace Web Chat's store to clear the conversation.

> _Note: This is just a proof of concept thus should not be used in production
> and lacks security considerations._

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/17.b.clear-after-idle)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/17.b.clear-after-idle` in the command line
-  Run `npm install && npm run start` in the directory
-  Browse to [http://localhost:3000/](http://localhost:3000/)

# Things to try out

-  Send a message to the bot and let the timer expire - this will start a new conversation.
-  Send a message to the bot and send another one before the timer expires - this will keep the conversation active.

# Code

> Jump to [completed code](#completed-code) to see the end-result `App.js`, `Timer.js`, and `useTimer.js`.

## Overview

This sample demonstrates how to clear the conversation data and start a new conversation with the user after the conversation has sat idle for a set time. To accomplish this, we created a custom hook - `useTimer` - that takes a callback as a parameter, which is called when the timer expires, and returns an array containing the time remaining in milliseconds - `timeRemaining` - and a method to set the time remaining - `setTimeRemaining`.

```javascript
import { useEffect, useState } from 'react';

export default function useTimer(fn, step = 1000) {
   const [timeRemaining, setTimeRemaining] = useState();

   useEffect(() => {
      let timeout;
      if (timeRemaining > 0) {
         timeout = setTimeout(() => setTimeRemaining(ms => (ms > step ? ms - step : 0)), step);
      } else if (timeRemaining === 0) {
         setTimeRemaining();
         fn();
      }

      return () => clearTimeout(timeout);
   }, [fn, timeRemaining, setTimeRemaining, step]);

   return [timeRemaining, setTimeRemaining];
}
```

We also created a custom store middleware that resets the timer by calling `setTimeRemaining` with the default time interval when the user submits the send box.

```javascript
setStore(
   createStore({}, ({ dispatch }) => next => action => {
      if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
         dispatch({
            type: 'WEB_CHAT/SEND_EVENT',
            payload: {
               name: 'webchat/join',
               value: { language: window.navigator.language }
            }
         });
      } else if (action.type === 'WEB_CHAT/SUBMIT_SEND_BOX') {
         // Reset the timer when the user sends an activity
         setTimeRemaining(TIME_INTERVAL);
      }

      return next(action);
   })
);
```

If the user stops participating in the conversation and the timer expires, we will replace the store to clear the conversation data. However, when the store is replaced, Web Chat dispatches a `'DIRECT_LINE/DISCONNECT'`, so we also need to request a new token. The `initConversation` method handles both replacing the custom store and requesting a new Direct Line token to start a new conversation with the bot. This function is passed to the `useTimer` hook so the conversation will be restarted when the timer expires.

```javascript
const initConversation = useCallback(() => {
   setStore(
      createStore({}, ({ dispatch }) => next => action => {
         if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
            dispatch({
               type: 'WEB_CHAT/SEND_EVENT',
               payload: {
                  name: 'webchat/join',
                  value: { language: window.navigator.language }
               }
            });
         } else if (action.type === 'WEB_CHAT/SUBMIT_SEND_BOX') {
            // Reset the timer when the user sends an activity
            setTimeRemaining(TIME_INTERVAL);
         }

         return next(action);
      })
   );

   (async function() {
      const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
      const { token } = await res.json();

      setDirectLine(createDirectLine({ token }));
   })().catch(error => console.log(error));
}, [setStore, setDirectLine]);

useEffect(initConversation, []);

const [timeRemaining, setTimeRemaining] = useTimer(initConversation);
```

## Completed Code

Here is the finished `App.js`:

```jsx
import React, { useCallback, useEffect, useState } from 'react';
import ReactWebChat, { createDirectLine, createStore } from 'botframework-webchat';

import './App.css';
import Timer from './Timer';
import useTimer from './utils/useTimer';

const TIME_INTERVAL = 30000;

function App() {
   const [directLine, setDirectLine] = useState(createDirectLine({}));
   const [store, setStore] = useState();

   const initConversation = useCallback(() => {
      setStore(
         createStore({}, ({ dispatch }) => next => action => {
            if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
               dispatch({
                  type: 'WEB_CHAT/SEND_EVENT',
                  payload: {
                     name: 'webchat/join',
                     value: { language: window.navigator.language }
                  }
               });
            } else if (action.type === 'WEB_CHAT/SUBMIT_SEND_BOX') {
               setTimeRemaining(TIME_INTERVAL);
            }

            return next(action);
         })
      );

      (async function() {
         const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
         const { token } = await res.json();

         setDirectLine(createDirectLine({ token }));
      })().catch(error => console.log(error));
   }, [setStore, setDirectLine]);

   useEffect(initConversation, []);

   const [timeRemaining, setTimeRemaining] = useTimer(initConversation);

   return (
      <div className="App">
         <Timer timeRemaining={timeRemaining} />
         <ReactWebChat className="chat" directLine={directLine} store={store} />
      </div>
   );
}

export default App;
```

# Further reading

-  [Hooks at a Glance](https://reactjs.org/docs/hooks-overview.html)
-  [Web Chat Back Channel Welcome Event Sample](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/15.d.backchannel-send-welcome-event)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
