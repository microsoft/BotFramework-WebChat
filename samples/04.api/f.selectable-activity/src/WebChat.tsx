import { type ActivityMiddleware } from 'botframework-webchat-api';
import React, { memo, useEffect, useState } from 'react';

import ReactWebChat, { createDirectLine } from 'botframework-webchat';

function WebChat({ activityMiddleware }: Readonly<{ activityMiddleware: ActivityMiddleware }>) {
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
      activityMiddleware={activityMiddleware}
      className="chat"
      directLine={directLine}
      styleOptions={{
        backgroundColor: 'Transparent'
      }}
    />
  ) : (
    <div>Connecting to bot&hellip;</div>
  );
}

export default memo(WebChat);
