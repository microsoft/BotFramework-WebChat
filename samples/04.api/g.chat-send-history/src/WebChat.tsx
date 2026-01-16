import { type createStore } from 'botframework-webchat';
import React, { memo, useEffect, useState } from 'react';

import ReactWebChat, { createDirectLine } from 'botframework-webchat';

function WebChat({ store }: Readonly<{ store: ReturnType<typeof createStore> }>) {
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
