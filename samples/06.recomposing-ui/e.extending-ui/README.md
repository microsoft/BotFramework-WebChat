# Extending Web Chat with custom UI components

This sample shows how to extend the default UI for Web Chat to include your own UI components. This allows developers to create features within the Web Chat UI without having to re-implement already existing UI elements. For example, this sample will show how to insert a custom button between the chat transcript and the chat message box.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/06.recomposing-ui/e.extending-ui)

# Things to try out

-  Click the custom "Say Hello!" button.

# Code

This project is based on [`create-react-app`](https://github.com/facebook/create-react-app).

The completed code contains multiple files. You can start by reading [`App.js`](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/06.recomposing-ui/e.extending-ui/src/App.js), which replaces the default Web Chat renderer with [`<CustomWebChat>`](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/06.recomposing-ui/e.extending-ui/src/CustomWebChat.js). The `<CustomWebChat>` component resembles the implementation of the [`<BasicWebChat>`](https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/component/src/BasicWebChat.tsx) component that's used in the default Web Chat.

> Jump to [completed code](#completed-code) to see the end-result `App.js`, `CustomWebChat.js`, and `HelloButton.js`.

## Overview

### `App.js`

[`App.js`](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/06.recomposing-ui/e.extending-ui/src/App.js) will set up the container for hosting Web Chat components. The container will be using Direct Line chat channel. `getDirectLineToken()` asynchronously retrieves and sets the Direct Line token (you'll need to implement this yourself).

<!-- prettier-ignore-start -->
```javascript
const App = () => {
  const [directLine, setDirectLine] = React.useState();

  if (!directLine) {
    getDirectLineToken().then(token => setDirectLine(createDirectLine({ token })));
  }
  ...
```
<!-- prettier-ignore-end -->

We then pass the `directLine` token to the `Composer` component when it has a value. The `Composer` component is provided by Web Chat to allow developers to compose their own UI. Any component that is a descendant of the `Composer` will have access to the context of the chat through higher-order components and React Hooks.

<!-- prettier-ignore-start -->
```javascript
  ...
  return (
    <React.Fragment>
      {!!directLine && (
        <Components.Composer directLine={directLine}>
          <CustomWebChat />
        </Components.Composer>
      )}
    </React.Fragment>
  );
}
```
<!-- prettier-ignore-end -->

### `CustomWebChat.js`

The `App.js` implementation places a component named `CustomWebChat` as a child of the `Composer`. The purpose of this component is to resemble the [`BasicWebChat`](https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/component/src/BasicWebChat.tsx) component provided by the Web Chat components library, but provide a way for us to add our own custom components into the UI.

Lets start by first implementing the default `BasicWebChat` inside of `CustomWebChat`:

<!-- prettier-ignore-start -->
```javascript
import { Components } from 'botframework-webchat-component';

const CustomWebChat = () => {
  return (
    <Components.AccessKeySinkSurface>
      <Components.BasicToaster />
      <Components.BasicTranscript />
      <Components.BasicConnectivityStatus />
      <Components.BasicSendBox />
    </Components.AccessKeySinkSurface>
  );
};
```
<!-- prettier-ignore-end -->

If you were to save, compile and run the code right now, you'll see the default Web Chat experience. This is because the `Basic*` components are the exact same components used by the `BasicWebChat` component. You can choose to modify these components however you like: remove, reorder, pass custom props (such as styling), etc. In this sample, however, we're going to demonstrate adding a completely new component to the UI.

### `HelloButton.js`

Our new component will be a "Say Hello!" button place right above the message box. When a user clicks this button, "Hello!" will be sent to the chat. This component will need to take advantage of the `useSendMessage` hook in order to be able to interact with the chat.

<!-- prettier-ignore-start -->
```javascript
import { hooks } from 'botframework-webchat-component';

const { useSendMessage } = hooks;

const HelloButton = () => {  
  const sendMessage = useSendMessage();

  return (
    <button onClick={() => sendMessage("Hello!")}>Say Hello!</button>
  );
};
```
<!-- prettier-ignore-end -->

We can then place our `HelloButton` component in the `CustomWebChat` component wherever we want. In our scenario, we want it right above the `BasicSendBox`.

<!-- prettier-ignore-start -->
```javascript
import { Components } from 'botframework-webchat-component';
import HelloButton from './HelloButton';

const CustomWebChat = () => {
  return (
    <Components.AccessKeySinkSurface>
      <Components.BasicToaster />
      <Components.BasicTranscript />
      <Components.BasicConnectivityStatus />
      <HelloButton />
      <Components.BasicSendBox />
    </Components.AccessKeySinkSurface>
  );
};
```
<!-- prettier-ignore-end -->

If you save, compile and run the code, you'll see a "Say Hello!" button right above the message box. When you click it, "Hello!" will be sent to the chat!

## Completed Code

`App.js` (simplified):

<!-- prettier-ignore-start -->
```javascript
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
    getDirectLineToken().then(token => setDirectLine(createDirectLine({ token })));
  }

  return (
    <React.Fragment>
      {!!directLine && (
        <Components.Composer directLine={directLine}>
          <CustomWebChat />
        </Components.Composer>
      )}
    </React.Fragment>
  );
};

export default App;
```
<!-- prettier-ignore-end -->

`CustomWebChat.js`:

<!-- prettier-ignore-start -->
```javascript
import React from 'react';
import { Components } from 'botframework-webchat-component';
import HelloButton from './HelloButton';

const CustomWebChat = () => {
  return (
    <Components.AccessKeySinkSurface>
      <Components.BasicToaster />
      <Components.BasicTranscript />
      <Components.BasicConnectivityStatus />
      <HelloButton />
      <Components.BasicSendBox />
    </Components.AccessKeySinkSurface>
  );
};

export default CustomWebChat;
```
<!-- prettier-ignore-end -->

`HelloButton.js`:

<!-- prettier-ignore-start -->
```javascript
import React from 'react';
import { hooks } from 'botframework-webchat-component';

const { useSendMessage } = hooks;

const HelloButton = () => {  
  const sendMessage = useSendMessage();

  return (
    <button onClick={() => sendMessage("Hello!")}>Say Hello!</button>
  );
};

export default HelloButton;
```
<!-- prettier-ignore-end -->

# Further reading

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples)
