# Sample - Using hybrid speech engine

A simple web page that uses separate speech engines for speech-to-text and text-to-speech. This sample makes changes that are based off of the [Cognitive Services Speech Services sample](./../06.c.cognitive-services-speech-services-js/README.md).

# Test out the hosted sample

- [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/06.f.hybrid-speech)

# How to run locally

- Fork this repository
- Navigate to `/Your-Local-WebChat/samples/06.f.hybrid-speech` in command line
- Run `npx serve`
- Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

- Use the microphone button: you should be able to provide commands to the bot via speech
- Speak `help`: you should see a full list of MockBot features
- Speak `card weather`: you should see a weather card built using Adaptive Cards
- Speak `carousel`: you should see a carousel of cards

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

### Goals of this bot

The `index.html` page has one main goal:

- To enable speech by using different engines:
   - Speech-to-text: browser-supported speech engine
   - Text-to-speech: Cognitive Services Speech Services engine

We will start by using the [Cognitive Services Speech Services sample](./../06.c.cognitive-services-speech-services-js/README.md) as our Web Chat template.

> Web browser speech package is available in the Web Chat core bundle and the full bundle, and you can use either CDN in your bot.

[TBD]

## Completed code

Here is the finished `index.html`:

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Hybrid speech engine using JavaScript</title>
    <!-- Cognitive Services Speech Services adapter is only available in full bundle -->
    <!--
      For demonstration purposes, we are using the development branch of Web Chat at "/master/webchat.js".
      When you are using Web Chat for production, you should use the latest stable release at "/latest/webchat.js",
      or lock down on a specific version with the following format: "/4.1.0/webchat.js".
    -->
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
        // In this demo, we are using Direct Line token from MockBot.
        // To talk to your bot, you should use the token exchanged using your Direct Line secret.
        // You should never put the Direct Line secret in the browser or client app.
        // https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication

        const directLineTokenRes = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await directLineTokenRes.json();

        // For this demo, we are using our authorization token. For your production code, you should use a token from your Cognitive Services subscription.
        const speechServicesTokenRes = await fetch('https://webchat-mockbot.azurewebsites.net/speechservices/token', { method: 'POST' });
        const { region, token: authorizationToken } = await speechServicesTokenRes.json();

+       // We are creating a hybrid ponyfill factory that will merge the result of two ponyfill factories together.
+       async function createHybridPonyfillFactory({ authorizationToken, region }) {
+         const speechServicesPonyfillFactory = await window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory({ authorizationToken, region });
+         const webSpeechPonyfillFactory = await window.WebChat.createBrowserWebSpeechPonyfillFactory();

+         return options => {
+           // We are using two ponyfill factories to create two concrete ponyfills.
+           const speechServicesPonyfill = speechServicesPonyfillFactory(options);
+           const webSpeechPonyfill = webSpeechPonyfillFactory(options);

+           // And we are merging the result from two different ponyfills.
+           // We use browser-supported speech for speech-to-text, and Speech Services for text-to-speech.
+           return {
+             SpeechGrammarList: webSpeechPonyfill.SpeechGrammarList,
+             SpeechRecognition: webSpeechPonyfill.SpeechRecognition,

+             speechSynthesis: speechServicesPonyfill.speechSynthesis,
+             SpeechSynthesisUtterance: speechServicesPonyfill.SpeechSynthesisUtterance
+           }
+         };
+       };

        // Pass a Web Speech ponyfill factory to renderWebChat.
        // You can also use your own speech engine, given it is compliant to W3C Web Speech API, https://w3c.github.io/speech-api/.
        // For implementation, look at createBrowserWebSpeechPonyfill.js for details.
        window.WebChat.renderWebChat({
          directLine: window.WebChat.createDirectLine({ token }),
+         webSpeechPonyfillFactory: await createHybridPonyfillFactory({ authorizationToken, region })
        }, document.getElementById('webchat'));

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>
```

# Further Reading

## Full list of Web Chat hosted samples

View the list of available samples by clicking [here](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples)
