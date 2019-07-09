# Sample - Adding Speech Cognitive Services Bing Speech with React

## Description

A simple web page with a maximized and full-featured Web Chat embed from a CDN, with cognitive services added for text-to-speech ability. This sample is implemented with React and makes changes that are based off of the [host with React sample](../03.a.host-with-react).

> Please note that Bing Speech has been deprecated, and no new subscriptions can be created. This sample is still available to users who already have a Bing Speech subscription. If you do not, please see the Cognitive Services Speech Services samples.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/06.b.cognitive-services-bing-speech-react)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/06.a.cognitive-services-bing-speech-react` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Use the microphone button: you should be able to provide commands to the bot via speech
-  Speak `help`: you should see a full list of MockBot features
-  Speak `card weather`: you should see a weather card built using Adaptive Cards
-  Speak `carousel`: you should see a carousel of cards

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

### Goals of this bot

The `index.html` page has one main goal:

-  To enable Cognitive Services Bing Speech to provide speech-to-text ability

We'll start by using the [host with React sample](../03.a.host-with-react) as our Web Chat React template.

> Cognitive Services Bing Speech package is only available in the Web Chat full bundle

There are two ways to authenticate with Cognitive Services Speech Services, either using subscription key, or time-limited authorization token.

## Completed code

#### Using subscription key

> This approach is for demonstration purposes only. In production code, you should always store the subscription key on a secured token server. The token server should only send out limited authorization code. This [article on authorizations](https://docs.microsoft.com/en-us/azure/cognitive-services/speech/api-reference-rest/websocketprotocol#authorization) outlines the authorization process.

In this portion, we are hardcoding the subscription key in the client code.

Here is the finished `index.html` for subscription key flow:

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Cognitive Services Bing Speech using React</title>
    <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
    <script src="https://unpkg.com/react@16.5.0/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@16.5.0/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/react-redux@5.0.7/dist/react-redux.min.js"></script>
    <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
    <style>
      html, body { height: 100% }
      body { margin: 0 }

      #webchat {
        height: 100%;
        width: 100%;
      }
    </style>
  </head>
  <body>
    <div id="webchat" role="main"></div>
    <script type="text/babel">
      (async function () {
        'use strict';

        const { render } = window.ReactDOM;
        const {
          Context,
          createCognitiveServicesBingSpeechPonyfillFactory,
          createDirectLine,
          ReactWebChat
        } = window.WebChat;

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();

+       const subscriptionKey = new URLSearchParams(window.location.search).get('s');

+       const webSpeechPonyfillFactory = await createCognitiveServicesBingSpeechPonyfillFactory({ subscriptionKey });

        render(
          <ReactWebChat
            directLine={ createDirectLine({ token }) }
+           webSpeechPonyfillFactory={ webSpeechPonyfillFactory }
          />,
          document.getElementById('webchat')
        );

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>

```

#### Using authorization token

In this portion, we are retrieving the authorization token from a token server.

Here is the finished `index.html` for authorization token flow:

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Cognitive Services Bing Speech using React</title>

    <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
    <script src="https://unpkg.com/react@16.5.0/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@16.5.0/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/react-redux@5.0.7/dist/react-redux.min.js"></script>

    <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
    <style>
      html, body { height: 100% }
      body { margin: 0 }

      #webchat {
        height: 100%;
        width: 100%;
      }
    </style>
  </head>
  <body>
    <div id="webchat" role="main"></div>
    <script type="text/babel">
      (async function () {
        'use strict';

        const { render } = window.ReactDOM;
        const {
          Context,
          createCognitiveServicesBingSpeechPonyfillFactory,
          createDirectLine,
          ReactWebChat
        } = window.WebChat;

+       const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });

+       const { token } = await res.json();

+       const webSpeechPonyfillFactory = await createCognitiveServicesBingSpeechPonyfillFactory({ authorizationToken });

        render(
          <ReactWebChat
            directLine={ createDirectLine({ token }) }
+           webSpeechPonyfillFactory={ webSpeechPonyfillFactory }
          />,
          document.getElementById('webchat')
        );

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>
```

# Further reading

-  [Cognitive Services Speech Services bot](https://microsoft.github.io/BotFramework-WebChat/06.c.cognitive-services-speech-services-js) | [(Cognitive Services Speech Services source code)](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/06.c.cognitive-services-speech-services-js)

## Full list of Web Chat Hosted Samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
