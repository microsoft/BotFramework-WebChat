# Sample - Using hybrid speech engine

A simple web page that uses separate speech engines for speech-to-text and text-to-speech. This sample makes changes that are based off of the [Cognitive Services Speech Services sample](./../03.speech/b.cognitive-speech-services-js/README.md).

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/03.speech/g.hybrid-speech)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/03.speech/g.hybrid-speech` in command line
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

-  To enable speech by using different engines:
   -  Speech-to-text: browser-supported speech engine
   -  Text-to-speech: Cognitive Services Speech Services engine

We will start by using the [Cognitive Services Speech Services sample](./../03.speech/b.cognitive-speech-services-js/README.md) as our Web Chat template.

> Web browser speech package is available in the Web Chat core bundle and the full bundle, and you can use either CDN in your bot.

This sample creates a new ponyfill factory by combining the browser speech engine for speech-to-text and Cognitive Services for text-to-speech. By creating our own ponyfill we are able to pick and choose which aspects to use from which engine.

Create an async factory called `createHybridPonyfillFactory` that will build our hybrid.

<!-- prettier-ignore-start -->
```js
async function createHybridPonyfillFactory({ authorizationToken, region }) {…}
```
<!-- prettier-ignore-end -->

Create two ponyfills, one from Speech Services and the other from Web Speech.

```diff
  async function createHybridPonyfillFactory({ authorizationToken, region }) {
+   const speechServicesPonyfillFactory = await window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory({
+     authorizationToken: fetchSpeechServicesToken,
+     region: await fetchSpeechServicesRegion()
+   });
+   const webSpeechPonyfillFactory = await window.WebChat.createBrowserWebSpeechPonyfillFactory();
  …
  };
```

Combine into one ponyfill the features you want to pull from Web Speech and Speech Services respectively

```diff
  …
+   return options => {
+     const speechServicesPonyfill = speechServicesPonyfillFactory(options);
+     const webSpeechPonyfill = webSpeechPonyfillFactory(options);
+
+   return {
+     SpeechGrammarList: webSpeechPonyfill.SpeechGrammarList,
+     SpeechRecognition: webSpeechPonyfill.SpeechRecognition,
+
+     speechSynthesis: speechServicesPonyfill.speechSynthesis,
+     SpeechSynthesisUtterance: speechServicesPonyfill.SpeechSynthesisUtterance
+   }
  };

```

Finally, pass your new ponyfill factory into `renderWebChat`.

```diff
  window.WebChat.renderWebChat({
    directLine: window.WebChat.createDirectLine({ token }),
+   webSpeechPonyfillFactory: await createHybridPonyfillFactory({ authorizationToken, region })
  }, document.getElementById('webchat'));
```

## Completed code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Hybrid speech engine using JavaScript</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script crossorigin="anonymous" src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
    <style>
      html,
      body {
        height: 100%;
      }

      body {
        margin: 0;
      }

      #webchat {
        height: 100%;
        width: 100%;
      }
    </style>
  </head>
  <body>
    <div id="webchat" role="main"></div>
    <script>
      function createFetchSpeechServicesCredentials() {
        let expireAfter = 0;
        let lastPromise;

        return () => {
          const now = Date.now();
          if (now > expireAfter) {
            expireAfter = now + 300000;
            lastPromise = fetch('https://webchat-mockbot.azurewebsites.net/speechservices/token', {
              method: 'POST'
            }).then(
              res => res.json(),
              err => {
                expireAfter = 0;

                return Promise.reject(err);
              }
            );
          }

          return lastPromise;
        };
      }

      const fetchSpeechServicesCredentials = createFetchSpeechServicesCredentials();

      (async function() {
        const directLineTokenRes = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', {
          method: 'POST'
        });
        const { token } = await directLineTokenRes.json();
        async function createHybridPonyfillFactory({ credentials }) {
          const speechServicesPonyfillFactory = await window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory(
            {
              credentials
            }
          );

          const webSpeechPonyfillFactory = await window.WebChat.createBrowserWebSpeechPonyfillFactory();

          return options => {
            const speechServicesPonyfill = speechServicesPonyfillFactory(options);
            const webSpeechPonyfill = webSpeechPonyfillFactory(options);

            return {
              SpeechGrammarList: webSpeechPonyfill.SpeechGrammarList,
              SpeechRecognition: webSpeechPonyfill.SpeechRecognition,

              speechSynthesis: speechServicesPonyfill.speechSynthesis,
              SpeechSynthesisUtterance: speechServicesPonyfill.SpeechSynthesisUtterance
            };
          };
        }

        window.WebChat.renderWebChat(
          {
            directLine: window.WebChat.createDirectLine({ token }),
            webSpeechPonyfillFactory: await createHybridPonyfillFactory({ credentials: fetchSpeechServicesCredentials })
          },
          document.getElementById('webchat')
        );

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>
```
<!-- prettier-ignore-end -->

# Further Reading

-  [Cognitive Speech Speech Services](https://azure.microsoft.com/en-us/services/cognitive-services/speech-services/)
-  [W3C Web Speech API](https://w3c.github.io/speech-api/)
-  [JavaScript Factory Functions with ES6+](https://medium.com/javascript-scene/javascript-factory-functions-with-es6-4d224591a8b1)

-  [Cognitive Services Speech Services bot](https://microsoft.github.io/BotFramework-WebChat/03.speech/b.cognitive-speech-services-js) | [(Cognitive Services Speech Services source code)](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/03.speech/b.cognitive-speech-services-js)
-  [Speech Web browser bot](https://microsoft.github.io/BotFramework-WebChat/03.speech/g.hybrid-speech) | [(Speech Web browser source code)](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/03.speech/g.hybrid-speech)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
