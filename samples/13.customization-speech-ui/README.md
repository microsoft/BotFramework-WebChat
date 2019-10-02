# Customize Web Chat as a Breakaway Component

## Description

A simple React web site that use 3 pieces of custom UI:

-  [Microphone button](src/CustomMicrophoneButton.js): a `<button>` to start/stop microphone input
-  [Dictation interims](src/CustomDictationInterims.js): a `<p>` to show dictation interims
-  [Last bot activity](src/LastBotActivity.js): a new component which show the last message activity from bot

This app is built with `create-react-app`.

### Incompatible with Safari

Currently, this sample does not work under Safari. Safari requires explicit user interaction to start recording on the microphone or playing audio clips. This is being investigated in [issue #995](https://github.com/microsoft/BotFramework-WebChat/issues/995).

- Speech-to-text: after the user clicks the microphone, we fetch an authorization token and then start recording on the microphone
   - The network call to fetch the token "disconnect" the user interaction and recording, thus, Safari considered the recording do not have explicit grant from the user and denied access
- Text-to-speech: the synthesized text is played when the bot sends the message, without any user interactions
   - Since the synthesized text is an audio clip and started playing without user interactions, Safari denied access to speaker

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/13.customization-speech-ui)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/13.customization-speech-ui` in command line
-  Run `npm install`
-  Run `npm start`
-  Browse to [http://localhost:3000/](http://localhost:3000/)

# Things to try out

-  Notice there is a Microphone button instead of a Send Box.
-  Press the button and speak 'hello'
-  Mock Bot will respond via speech

# Code

> Jump to [completed code](#completed-code) to see the end-result `App.js`, `CustomMicrophoneButton.js`, `CustomDictationInterims.js` and `LastBotActivity.js`.

# Overview

This sample uses the base components of Web Chat to build new breakaway components that suit the individual bot. In this case, we are creating a speech UI that only displays:

1. The last message of the bot
1. Dictation while the user is speaking
1. The Microphone button to initiate speech-to-text

Notice that traditional Web Chat 'pieces' are missing: the transcript and send box are not present on this app.

The intent of this bot is to show our users how you can pick and choose what components you want to use, allowing for expansion and modification of how traditional Web Chat works. If you have a significantly different design spec for your bot, but would still like to use Web Chat, looking at this sample is a great place to start.

To see what components are available for customization, please take a look at the [components directory](https://github.com/microsoft/BotFramework-WebChat/tree/master/packages/component/src) of the Web Chat repo. You are welcome to import any one of these into your app and make modifications, or build an entirely new component from scratch.

First, let's take a look at the `App.js` file.

Note that this is the component that builds up the other components we will create. We will need to import `<Composer>` from Web Chat to form the container of our application. Inside the composer, our imported components that we will create will be utilized within that container.

We will be using the node package manager, and installing several dependencies into an app that is made up of multiple files.

> Please note that while this sample does have `.css` files, they will not be discussed in this overview, though the `jsx` code snippets will include class names for reference purposes.

Let's set up the project.

```sh
cd C:\Users\You\Documents
npx create-react-app 13.customization-speech-ui
cd 13.customization-speech-ui
npm i botframework-webchat
```

Note that once `create-react-app` finishes running, you should have the following directories and files:

```sh
.git
node_modules
public
src
.gitignore
package.json
README.md
yarn.lock
```

> The `build` directory will also be visible if you are referencing the project within your local Web Chat repo.

Your source code will be located inside the `src` directory. When `npm start` is run, your app will be served out of the `public` directory.

Create the following files in `src`:

```sh
CustomDictation.js
CustomMicrophoneButton.js
fetchSpeechToken.js
LastBotActivity.js
```

Open the project in your preferred IDE.

Let's first work on fetching the Speech Services token, which we will need to regularly refresh. Because we do not want to expose any secrets in this app, it is recommended to create a server-side functionality that will retrieve a token for you. In Mock Bot, that API is located at `'https://webchat-mockbot.azurewebsites.net/speechservices/token'`

1. Initialize the variables `RENEW_EVERY`, `fetchPromise`, and `lastFetch`. These will be used to calculate the time between fetches, and return the token to the parent component, `App.js`.
1. `fetch` will be called if the token is unknown, or if the `RENEW_EVERY` duration (300 seconds) has passed.

```jsx
const RENEW_EVERY = 300000;
let fetchPromise,
   lastFetch = 0;

export default function() {
   const now = Date.now();

   if (!fetchPromise || now - lastFetch > RENEW_EVERY) {
      fetchPromise = fetch('https://webchat-mockbot.azurewebsites.net/speechservices/token', { method: 'POST' })
         .then(res => res.json())
         .then(({ token }) => token)
         .catch(() => {
            lastFetch = 0;
         });

      lastFetch = now;
   }

   return fetchPromise;
}
```

This component is finished and can be imported into `App.js`.

Next, let's create our Microphone Button. Web Chat already has a built-in Microphone icon, but we want to modify it to be larger.

1. In `CustomMicrophoneButton.js`, import `React` and `{ Components }` from `botframework-webchat`. We will also import the Microphone icon
1. Extract `connectMicrophoneButton` from `Components.

```js
import classNames from 'classnames';
import React from 'react';
import { Components } from 'botframework-webchat';

import MicrophoneIcon from './MicrophoneIcon';

const { connectMicrophoneButton } = Components;
```

Next we will export a new `connectMicrophoneButton` method that will display the Microphone icon in a button and make it large.

```jsx
export default connectMicrophoneButton()(({ className, click, dictating, disabled }) => (
   <button className={classNames(className, { dictating })} disabled={disabled} onClick={click}>
      <MicrophoneIcon size="10vmin" />
   </button>
));
```

This component is finished and can now be imported into `App.js`.

Let's now work on `CustomDictationInterims`.

We want to import the pieces that make up dictation, but we will render them differently (from Web Chat) in our component.

1. Import `React` and `Components` and `Constants` from `botframework-webchat`
1. Extract `connectDictationInterims` from Components and `DictateState`, `DICTATING`, and `STARTING` from `Constants`
1. Modify the function `connectDictationInterims()` to render a paragraph that displays what speech is being detected, to be sent to the bot.

```jsx
import React from 'react';

import { Components, Constants } from 'botframework-webchat';

const { connectDictationInterims } = Components;
const {
   DictateState: { DICTATING, STARTING }
} = Constants;

export default connectDictationInterims()(
   ({ className, dictateInterims, dictateState }) =>
      (dictateState === STARTING || dictateState === DICTATING) &&
      !!dictateInterims.length && (
         <p className={className}>
            {dictateInterims.map((interim, index) => (
               <span key={index}>{interim}&nbsp;</span>
            ))}
         </p>
      )
);
```

Next is the `LastBotActivity`, which will be displayed in place of a transcript.

1. Import `React` and `Components` and `connectToWebChat` from `botframework-webchat`
1. Extract `SpeakActivity` from `Components`
1. Modify the function `connectToWebChat`, which will show the latest activity text from the bot as well as speak it.

```jsx
import React from 'react';

import { connectToWebChat, Components } from 'botframework-webchat';

const { SpeakActivity } = Components;

export default connectToWebChat(({ activities }) => ({
   activity: activities
      .slice()
      .reverse()
      .find(({ from: { role }, type }) => role === 'bot' && type === 'message')
}))(
   ({ activity }) =>
      !!activity && (
         <React.Fragment>
            <p>{activity.text}</p>
            {activity.channelData && activity.channelData.speak && <SpeakActivity activity={activity} />}
         </React.Fragment>
      )
);
```

Finally, let's return to `App.js`. Your imports should look like the following:

```jsx
import './App.css';
import {
   Components,
   createDirectLine,
   createCognitiveServicesSpeechServicesPonyfillFactory
} from 'botframework-webchat';
import React, { Component } from 'react';

import CustomDictationInterims from './CustomDictationInterims';
import CustomMicrophoneButton from './CustomMicrophoneButton';
import fetchSpeechServicesToken from './fetchSpeechServicesToken';
import LastBotActivity from './LastBotActivity';

const { Composer } = Components;
```

Create and export the React App Component. Then set up the constructor, which will initialize the `state` of `directLine` as `null`

```js
export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      directLine: null
    };
  }
…
```

We want to use the `componentDidMount()` lifecycle method to handle fetching a token from Mock Bot. It is **never recommended** to put the Direct Line secret in the browser or client app. To learn more about secrets and tokens for Direct Line, visit this [tutorial on authentication](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication).

We will also use our newly made component, `fetchSpeechServicesToken`, with a hard-coded region to build up the `webSpeechPonyfillFactory` in the creation of DirectLine.

```js
async componentDidMount() {
  const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
  const { token } = await res.json();

  this.setState(() => ({
    directLine: createDirectLine({
      token,
      webSpeechPonyfillFactory: createCognitiveServicesSpeechServicesPonyfillFactory({
        region: 'westus',
        token: fetchSpeechServicesToken
      })
    })
  }));
}
```

Next we'll build the render method for App.

1. State will be declared with a directLine key
1. `<Composer>` will be rendered when directLine is not falsy
1. Inside the Composer, we will use our newly made components'

```jsx
render() {
  const {
    state: { directLine }
  } = this;

  return (
    !!directLine &&
      <Composer
        directLine={ directLine }
      >
        <div className="App">
          <header className="App-header">
            <CustomMicrophoneButton className="App-speech-button" />
            <CustomDictationInterims className="App-speech-interims" />
            <LastBotActivity className="App-bot-activity" />
          </header>
        </div>
      </Composer>
  );
}
```

This brings all of our new components together cohesively into the app.

## Completed Code

`App.js`:

```jsx
import './App.css';
import {
   Components,
   createDirectLine,
   createCognitiveServicesSpeechServicesPonyfillFactory
} from 'botframework-webchat';
import React, { Component } from 'react';

import CustomDictationInterims from './CustomDictationInterims';
import CustomMicrophoneButton from './CustomMicrophoneButton';
import fetchSpeechServicesToken from './fetchSpeechServicesToken';
import LastBotActivity from './LastBotActivity';

const { Composer } = Components;

export default class App extends Component {
   constructor(props) {
      super(props);

      this.state = {
         directLine: null
      };
   }

   async componentDidMount() {
      const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
      const { token } = await res.json();

      this.setState(() => ({
         directLine: createDirectLine({
            token,
            webSpeechPonyfillFactory: createCognitiveServicesSpeechServicesPonyfillFactory({
               region: 'westus',
               token: fetchSpeechServicesToken
            })
         })
      }));
   }

   render() {
      const {
         state: { directLine }
      } = this;

      return (
         !!directLine && (
            <Composer directLine={directLine}>
               <div className="App">
                  <header className="App-header">
                     <CustomMicrophoneButton className="App-speech-button" />
                     <CustomDictationInterims className="App-speech-interims" />
                     <LastBotActivity className="App-bot-activity" />
                  </header>
               </div>
            </Composer>
         )
      );
   }
}
```

`LastBotActivity`:

```jsx
import React from 'react';

import { connectToWebChat, Components } from 'botframework-webchat';

const { SpeakActivity } = Components;

export default connectToWebChat(({ activities }) => ({
   activity: activities
      .slice()
      .reverse()
      .find(({ from: { role }, type }) => role === 'bot' && type === 'message')
}))(
   ({ activity }) =>
      !!activity && (
         <React.Fragment>
            <p>{activity.text}</p>
            {activity.channelData && activity.channelData.speak && <SpeakActivity activity={activity} />}
         </React.Fragment>
      )
);
```

`CustomDictationInterims`:

```jsx
import React from 'react';

import { Components, Constants } from 'botframework-webchat';

const { connectDictationInterims } = Components;
const {
   DictateState: { DICTATING, STARTING }
} = Constants;

export default connectDictationInterims()(
   ({ className, dictateInterims, dictateState }) =>
      (dictateState === STARTING || dictateState === DICTATING) &&
      !!dictateInterims.length && (
         <p className={className}>
            {dictateInterims.map((interim, index) => (
               <span key={index}>{interim}&nbsp;</span>
            ))}
         </p>
      )
);
```

`CustomMicrophoneButton`:

```jsx
import classNames from 'classnames';
import React from 'react';
import { Components } from 'botframework-webchat';

import MicrophoneIcon from './MicrophoneIcon';

const { connectMicrophoneButton } = Components;

export default connectMicrophoneButton()(({ className, click, dictating, disabled }) => (
   <button className={classNames(className, { dictating })} disabled={disabled} onClick={click}>
      <MicrophoneIcon size="10vmin" />
   </button>
));
```

`fetchSpeechServicesToken`:

```jsx
const RENEW_EVERY = 300000;
let fetchPromise,
   lastFetch = 0;

export default function() {
   const now = Date.now();

   if (!fetchPromise || now - lastFetch > RENEW_EVERY) {
      fetchPromise = fetch('https://webchat-mockbot.azurewebsites.net/speechservices/token', { method: 'POST' })
         .then(res => res.json())
         .then(({ token }) => token)
         .catch(() => {
            lastFetch = 0;
         });

      lastFetch = now;
   }

   return fetchPromise;
}
```

# Further reading

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
