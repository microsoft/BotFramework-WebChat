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
This sample demonstrates how to clear the conversation data and start a new conversation with the user after the user has sat idle for a set period of time. Sending a message to the bot will start the timer in the upper right hand corner and subsequent messages will reset the timer and keep the conversation active. When the timer expires, a new token is requested to start a new conversation and the store is replaced to reset the conversation data in Web Chat. Note, when the store is replaced, Web Chat dispatches a `DIRECT_LINE/DISCONNECT` action so we will need to re-initialize our Direct Line object.

## Completed Code

Here is the finished `App.js`:

```jsx
import React, { useCallback, useEffect, useState } from "react";
import ReactWebChat, {
  createDirectLine,
  createStore
} from "botframework-webchat";

import "./App.css";
import Timer from "./Timer";

const TIME_INTERVAL = 30000;

function App() {
  const [directLine, setDirectLine] = useState(createDirectLine({}));
  const [store, setStore] = useState();
  const [timeRemaining, setTimeRemaining] = useState();

  const initConversation = useCallback(() => {
    setStore(
      createStore({}, ({ dispatch }) => next => action => {
        if (action.type === "DIRECT_LINE/CONNECT_FULFILLED") {
          dispatch({
            type: "WEB_CHAT/SEND_EVENT",
            payload: {
              name: "webchat/join",
              value: { language: window.navigator.language }
            }
          });
        }
        if (action.type === "WEB_CHAT/SUBMIT_SEND_BOX") {
          setTimeRemaining(TIME_INTERVAL);
        }
        return next(action);
      })
    );

    (async function() {
      const res = await fetch(
        "https://webchat-mockbot.azurewebsites.net/directline/token",
        { method: "POST" }
      );
      const { token } = await res.json();

      setDirectLine(createDirectLine({ token }));
    })().catch(error => console.log(error));
  }, [setStore, setDirectLine, setTimeRemaining]);

  const restartConversation = useCallback(() => {
    alert("Restarting Conversation");
    initConversation();
  }, [initConversation]);

  useEffect(() => {
    initConversation();
  }, []);

  return (
    <div className="App">
      <Timer
        onComplete={restartConversation}
        setTimeRemaining={setTimeRemaining}
        timeRemaining={timeRemaining}
      />
      <ReactWebChat className="chat" directLine={directLine} store={store} />
    </div>
  );
}

export default App;
```

Here is the finished `Timer.js`:
```jsx
import React from "react";

import useTimer from "./utils/useTimer";

export default function Timer({ onComplete, setTimeRemaining, timeRemaining }) {
  const ms = timeRemaining || 0;

  useTimer(timeRemaining, onComplete, setTimeRemaining);
  
  return <div className="timer">
      Time Remaining:{" "}
      <span className={`${timeRemaining < 10000 ? "timer-red" : ""}`}>
        {Math.floor(ms / 60000)}:{ ("0" + (Math.floor(ms / 1000) % 60)).slice(-2) }
      </span>
    </div>
}
```

Here is the finished `useTimer.js`:

```javascript
import { useEffect } from "react";

export default function useTimer(
  timeRemaining,
  fn,
  setTimeRemaining,
  step = 1000
) {
  useEffect(() => {
    let timeout;
    if (timeRemaining > 0) {
      timeout = setTimeout(
        () => setTimeRemaining(ms => (ms > step ? ms - step : 0)),
        step
      );
    } else if (timeRemaining === 0) {
      fn();
      setTimeRemaining();
    }

    return () => clearTimeout(timeout);
  }, [fn, timeRemaining, setTimeRemaining, step]);
}
```

# Further reading

-  [Hooks at a Glance](https://reactjs.org/docs/hooks-overview.html)
-  [Web Chat Back Channel Welcome Event Sample](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/15.d.backchannel-send-welcome-event)
## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
