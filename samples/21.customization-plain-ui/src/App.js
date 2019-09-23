import { Components } from 'botframework-webchat-component';
import { createDirectLine } from 'botframework-webchat';
import React from 'react';

import PlainWebChat from './PlainWebChat';

// In this demo, we are using Direct Line token from MockBot.
// To talk to your bot, you should use the token exchanged using your Direct Line secret.
// You should never put the Direct Line secret in the browser or client app.
// https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication

async function getDirectLineToken() {
  const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
  const { token } = await res.json();

  return token;
}

export default () => {
  const [directLine, setDirectLine] = React.useState();

  if (!directLine) {
    // We will load DirectLineJS asynchronously on first render.
    getDirectLineToken().then(token => setDirectLine(createDirectLine({ token })));
  }

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
        <a href="https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/21.customization-plain-ui/">
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
};
