import React, { memo, useEffect, useMemo, useState } from 'react';

import ReactWebChat, { createDirectLine, createStore } from 'botframework-webchat';
import dispatchIncomingActivityMiddleware from './dispatchIncomingActivityMiddleware';

function WebChat({ appDispatch }) {
  const store = useMemo(() => createStore({}, dispatchIncomingActivityMiddleware(appDispatch)), []);
  const [directLine, setDirectLine] = useState<ReturnType<typeof createDirectLine>>();

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    (async function () {
      const res = await fetch(
        'https://hawo-mockbot4-token-app.ambitiousflower-67725bfd.westus.azurecontainerapps.io/api/token/directline',
        { method: 'POST' }
      );
      const { token } = await res.json();

      signal.aborted || setDirectLine(createDirectLine({ token }));
    })();

    return () => abortController.abort();
  }, []);

  useEffect(() => {
    store.dispatch({
      type: 'WEB_CHAT/SET_SEND_BOX',
      payload: { text: 'sample:redux-middleware' }
    });
  }, [store]);

  return directLine ? (
    <ReactWebChat
      className="chat"
      directLine={directLine}
      store={store}
      styleOptions={{
        backgroundColor: 'Transparent'
      }}
    />
  ) : (
    <div>Connecting to bot&hellip;</div>
  );
}

export default memo(WebChat);
