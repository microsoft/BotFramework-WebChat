# Sample - Adding Speech Cognitive Services Bing Speech

## Description

A simple web page with a maximized and full-featured Web Chat embed from a CDN, with cognitive services added for text-to-speech ability. This sample makes changes that are based off of the [full-bundle CDN sample](../1.a.getting-started-full-bundle/README.md).

# Test out the hosted sample

- [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/06.a.cognitive-services-bing-speech-js)

# Things to try out

- Use the microphone button: you should be able to provide commands to the bot via speech
- Speak `help`: you should see a full list of MockBot features
- Speak `card weather`: you should see a weather card built using Adaptive Cards
- Speak `carousel`: you should see a carousel of cards

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

### Goals of this bot

The `index.html` page has one main goal:

- To enable Cognitive Services Bing Speech to provide speech-to-text ability

We'll start by using the [full-bundle CDN sample](../1.a.getting-started-full-bundle/README.md) as our Web Chat template.

> Cognitive Services Bing Speech package is only available in the Web Chat full bundle

There are two ways to authenticate with Cognitive Services Speech Services, either using subscription key, or time-limited authorization token.

#### Using subscription key

> This approach is for demonstration purpose only. In production code, you should always store the subscription key on a secured token server. The token server should only send out limited authorization code. This [article](https://docs.microsoft.com/en-us/azure/cognitive-services/speech/api-reference-rest/websocketprotocol#authorization) outlines the authorization process.

In this sample, we are hardcoding the subscription key in the client code.

```diff
…
  const { token } = await res.json();

  window.WebChat.renderWebChat({
    directLine: window.WebChat.createDirectLine({ token }),
+   webSpeechPonyfillFactory: await window.WebChat.createCognitiveServicesBingSpeechPonyfillFactory({ subscriptionKey: 'YOUR_SUBSCRIPTION_KEY' })
  }, document.getElementById('webchat'));
…
```

#### Using authorization token

In this sample, we are retrieving the authorization token from a token server.

```diff
…
  const { token } = await res.json();
+ const res = await fetch('https://YOUR_TOKEN_SERVER/', { method: 'POST' });
+ const { token: authorizationToken } = await res.json();

  window.WebChat.renderWebChat({
    directLine: window.WebChat.createDirectLine({ token }),
+   webSpeechPonyfillFactory: await window.WebChat.createCognitiveServicesBingSpeechPonyfillFactory({ authorizationToken })
  }, document.getElementById('webchat'));
…
```

## Completed code

### Using subscription key

Here is the finished `index.html` for subscription key flow:

```diff
  <!DOCTYPE html>
  <html lang="en-US">
    <head>
      <title>Web Chat: Cognitive Services Bing Speech using JavaScript</title>
      <script src="https://cdn.botframework.com/botframework-webchat/master/webchat.js"></script>
      <style>
        html, body { height: 100% }
        body { margin: 0 }

        #webchat,
        #webchat > * {
          height: 100%;
          width: 100%;
        }
      </style>
    </head>
    <body>
      <div id="webchat" role="main"></div>
      <script>
        (async function () {
          const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
          const { token } = await res.json();

          window.WebChat.renderWebChat({
            directLine: window.WebChat.createDirectLine({ token }),
+           webSpeechPonyfillFactory: await window.WebChat.createCognitiveServicesBingSpeechPonyfillFactory({ subscriptionKey: 'YOUR_SUBSCRIPTION_KEY' })
          }, document.getElementById('webchat'));

          document.querySelector('#webchat > *').focus();
        })().catch(err => console.error(err));
      </script>
    </body>
  </html>
```

### Using authorization token

Here is the finished `index.html` for authorization token flow:

```diff
  <!DOCTYPE html>
  <html lang="en-US">
    <head>
      <title>Web Chat: Cognitive Services Bing Speech using JavaScript</title>
      <script src="https://cdn.botframework.com/botframework-webchat/master/webchat.js"></script>
      <style>
        html, body { height: 100% }
        body { margin: 0 }

        #webchat,
        #webchat > * {
          height: 100%;
          width: 100%;
        }
      </style>
    </head>
    <body>
      <div id="webchat" role="main"></div>
      <script>
        (async function () {
          const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
          const { token } = await res.json();
+         const res = await fetch('https://YOUR_TOKEN_SERVER/', { method: 'POST' });
+         const { token: authorizationToken } = await res.json();

          window.WebChat.renderWebChat({
            directLine: window.WebChat.createDirectLine({ token }),
+           webSpeechPonyfillFactory: await window.WebChat.createCognitiveServicesBingSpeechPonyfillFactory({ authorizationToken })
          }, document.getElementById('webchat'));

          document.querySelector('#webchat > *').focus();
        })().catch(err => console.error(err));
      </script>
    </body>
  </html>
```

# Further reading

## Full list of Web Chat Hosted Samples

View the list of available samples by clicking [here](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples)
