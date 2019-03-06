# Sample - Integrating with Cognitive Services Speech Services

## Description
> Cognitive Services Speech Services support is current in preview. If you encounter any problems, please file us an issue at https://github.com/Microsoft/BotFramework-WebChat/issues/.

A simple page with Web Chat integrated with speech-to-text and text-to-speech feature from Cognitive Services Speech Services.

# Test out the hosted sample

- [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/6.c.cognitive-services-speech-services-js)

# How to run
- Fork this repository
- Navigate to `/Your-Local-WebChat/samples/06.c.cognitive-services-speech-services-js` in command line
- Run `npx serve`
- Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out
- Click on microphone button
- Say "123"
- It should recognize as "123."
- It should speak out the next activities sent from the bot

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

### Goals of this bot

Cognitive Services Speech Services has published a new API to provide speech recognition and synthesis. Web Chat uses the W3C Speech API standard, and supports interfacing Speech Services through an adapter.


## Completed code

#### Using subscription key

> This approach is for demonstration purposes only. In production code, you should always store the subscription key on a secured token server. The token server should only send out limited authorization code. This [article on authorizations](https://docs.microsoft.com/en-us/azure/cognitive-services/speech/api-reference-rest/websocketprotocol#authorization) outlines the authorization process.

In this portion, we are hardcoding the subscription key in the client code.

Here is the finished `index.html` for subscription key flow:

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Cognitive Services Speech Services using JavaScript</title>

    <script src="https://cdn.botframework.com/botframework-webchat/master/webchat.js"></script>
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
    <script>
      (async function () {
        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();

+       const searchParams = new URLSearchParams(window.location.search);

+       const subscriptionKey = searchParams.get('s');

+       const webSpeechPonyfillFactory = await window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory({
+           region: searchParams.get('r') || 'westus',
+           subscriptionKey
+         });
        }

        window.WebChat.renderWebChat({
          directLine: window.WebChat.createDirectLine({ token }),
+         webSpeechPonyfillFactory
        }, document.getElementById('webchat'));

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>
```

#### Using authorization token

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Cognitive Services Speech Services using JavaScript</title>
    <script src="https://cdn.botframework.com/botframework-webchat/master/webchat.js"></script>
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
    <script>
      (async function () {
        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();

+         const res = await fetch('https://webchat-mockbot.azurewebsites.net/speechservices/token', { method: 'POST' });
+         const { region, token: authorizationToken } = await res.json();

+         const webSpeechPonyfillFactory = await window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory({ authorizationToken, region });

        window.WebChat.renderWebChat({
          directLine: window.WebChat.createDirectLine({ token }),
+         webSpeechPonyfillFactory
        }, document.getElementById('webchat'));

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>
```
# Further reading
- [Cognitive Speech Speech Services website](https://azure.microsoft.com/en-us/services/cognitive-services/speech-services/)

## Full list of Web Chat Hosted Samples

View the list of [available Web Chat samples](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples)
