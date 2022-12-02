import { createDirectLine } from 'botframework-webchat';
import { Components } from 'botframework-webchat-component';
import React from 'react';
import CustomWebChat from './CustomWebChat';

// In this demo, we are using Direct Line token from MockBot.
// To talk to your bot, you should use the token exchanged using your Direct Line secret.
// You should never put the Direct Line secret in the browser or client app.
// https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication

async function getDirectLineToken() {
  const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
  const { token } = await res.json();

  return token;
}

const App = () => {
  const [directLine, setDirectLine] = React.useState();

  if (!directLine) {
    // We will load DirectLineJS asynchronously on first render.
    getDirectLineToken().then(token => setDirectLine(createDirectLine({ token })));
  }

  return (
    // We are using the "Composer" component here, which all descendants will have access to the Web Chat API by HOC-ing thru "connectToWebChat".
    <React.Fragment>
      <h1>Extending Web Chat with custom UI components</h1>

      <p>
        For the{' '}
        <a href="https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/06.recomposing-ui/e.extending-ui/">
          source code of this demo
        </a>
        , please visit <a href="https://github.com/microsoft/BotFramework-WebChat/">our GitHub repository</a>.
      </p>
      <hr />
      {!!directLine && (
        <Components.Composer directLine={directLine}>
          <CustomWebChat />
        </Components.Composer>
      )}
    </React.Fragment>
  );
};

export default App;
