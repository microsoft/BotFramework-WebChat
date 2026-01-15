/* eslint-disable react/jsx-no-literals */

import { Components, createDirectLine } from 'botframework-webchat';
import React, { memo, useEffect, useState } from 'react';
import PlainWebChat from './PlainWebChat';

// In this demo, we are using Direct Line token from MockBot.
// To talk to your bot, you should use the token exchanged using your Direct Line secret.
// You should never put the Direct Line secret in the browser or client app.
// https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication

async function getDirectLineToken(): Promise<string> {
  const res = await fetch(
    'https://hawo-mockbot4-token-app.ambitiousflower-67725bfd.westus.azurecontainerapps.io/api/token/directline',
    { method: 'POST' }
  );
  const { token } = await res.json();

  return token;
}

function App() {
  const [directLine, setDirectLine] = useState<ReturnType<typeof createDirectLine>>();

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    (async function () {
      const token = await getDirectLineToken();

      signal.aborted || setDirectLine(createDirectLine({ token }));
    })();

    return () => abortController.abort();
  }, []);

  return (
    // We are using the "Composer" component here, which all descendants will have access to the Web Chat API by HOC-ing thru "connectToWebChat".
    <React.Fragment>
      <h1>Web Chat with plain UI</h1>
      <p>
        This sample shows how to use Web Chat without any of its canned UI component. There are few conversation you can
        try out.
      </p>
      <ol>
        <li>
          Say <code>image</code> to the bot
        </li>
        <li>
          Say <code>suggested-actions</code> to the bot
        </li>
        <li>
          Say <code>card bingsports</code> to the bot
        </li>
      </ol>
      <p>
        For the{' '}
        <a href="https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/06.recomposing-ui/d.plain-ui/">
          source code of this demo
        </a>
        , please visit <a href="https://github.com/microsoft/BotFramework-WebChat/">our GitHub repository</a>.
      </p>
      <hr />
      {!!directLine && (
        <Components.Composer directLine={directLine}>
          <PlainWebChat />
        </Components.Composer>
      )}
    </React.Fragment>
  );
}

export default memo(App);
