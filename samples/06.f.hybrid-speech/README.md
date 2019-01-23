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

> Note: README.md in this sample is not yet complete.

## Completed code

Here is the finished `index.html`:

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Hybrid speech engine using JavaScript</title>
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
        const directLineTokenRes = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await directLineTokenRes.json();

        const speechServicesTokenRes = await fetch('https://webchat-mockbot.azurewebsites.net/speechservices/token', { method: 'POST' });
        const { region, token: authorizationToken } = await speechServicesTokenRes.json();

+       async function createHybridPonyfillFactory({ authorizationToken, region }) {
+         const speechServicesPonyfillFactory = await window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory({ authorizationToken, region });
+         const webSpeechPonyfillFactory = await window.WebChat.createBrowserWebSpeechPonyfillFactory();

+         return options => {
+           const speechServicesPonyfill = speechServicesPonyfillFactory(options);
+           const webSpeechPonyfill = webSpeechPonyfillFactory(options);

+           return {
+             SpeechGrammarList: webSpeechPonyfill.SpeechGrammarList,
+             SpeechRecognition: webSpeechPonyfill.SpeechRecognition,

+             speechSynthesis: speechServicesPonyfill.speechSynthesis,
+             SpeechSynthesisUtterance: speechServicesPonyfill.SpeechSynthesisUtterance
+           }
+         };
+       };

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
