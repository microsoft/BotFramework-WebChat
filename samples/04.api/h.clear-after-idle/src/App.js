import ReactWebChat, { createDirectLine, createStore } from 'botframework-webchat';
import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import Countdown from './Countdown';
import useTimeoutAt from './utils/useTimeoutAt';

const IDLE_TIMEOUT = 30000;

// In this demo, we are using Direct Line token from MockBot.
// Your client code must provide either a secret or a token to talk to your bot.
// Tokens are more secure. To learn about the differences between secrets and tokens
// and to understand the risks associated with using secrets, visit
// https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0
async function fetchToken() {
  const res = await fetch('https://webchat-mockbot3.azurewebsites.net/api/directline/token', { method: 'POST' });
  const { token } = await res.json();

  return token;
}

function App() {
  const [resetAt, setResetAt] = useState(() => Date.now() + IDLE_TIMEOUT);
  const [session, setSession] = useState();

  const initConversation = useCallback(() => {
    setSession(false);

    (async function () {
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
