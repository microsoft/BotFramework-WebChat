# Sample - Using speech recognition only

A simple web page that uses speech-to-text only and disable text-to-speech. This sample makes changes that are based off of the [Cognitive Services Speech Services sample](./../03.speech/b.cognitive-speech-services-js/README.md).

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/03.speech/d.cognitive-services-speech-recognition-only)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/03.speech/d.cognitive-services-speech-recognition-only` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Use the microphone button: you should be able to provide commands to the bot via speech
-  Speak `echo 123`: the bot reply with "Echoing back in a separate activity" and "123"

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

### Goals of this bot

The `index.html` page has one main goal:

-  To enable speech by using different engines:
   -  Speech-to-text: Cognitive Services Speech Services engine
   -  Text-to-speech: disabled

We will start by using the [Cognitive Services Speech Services sample](./../03.speech/b.cognitive-speech-services-js/README.md) as our Web Chat template.

> Web browser speech package is available in the Web Chat core bundle and the full bundle, and you can use either CDN in your bot.

This sample creates a new ponyfill factory by using speech-to-text engine from Cognitive Services Speech Services. By creating our own ponyfill we are able to pick and choose which aspects to use from which engine.

Create an async factory called `createSpeechRecognitionOnlyPonyfillFactory` that will build our hybrid.

<!-- prettier-ignore-start -->
```js
async function createSpeechRecognitionOnlyPonyfillFactory() {…}
```
<!-- prettier-ignore-end -->

Create a ponyfill factory from Speech Services.

```diff
  const speechServicesPonyfillFactory = await window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory(
    {
+     authorizationToken: fetchSpeechServicesToken,
+     region: await fetchSpeechServicesRegion()
    }
  );
```

Then return a new ponyfill factory that will call the one from Speech Services, but partially return the result.

```diff
  …
+   return options => {
+     const speechServicesPonyfill = speechServicesPonyfillFactory(options);
+
+     return {
+       SpeechGrammarList: speechServicesPonyfill.SpeechGrammarList,
+       SpeechRecognition: speechServicesPonyfill.SpeechRecognition
+     };
+   };
  …
```

Finally, pass your new ponyfill factory into `renderWebChat`.

```diff
  window.WebChat.renderWebChat({
    directLine: window.WebChat.createDirectLine({ token }),
+   webSpeechPonyfillFactory: await createSpeechRecognitionOnlyPonyfillFactory()
  }, document.getElementById('webchat'));
```

## Completed code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Speech recognition only</title>
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

        async function createSpeechRecognitionOnlyPonyfillFactory() {
          const speechServicesPonyfillFactory = await window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory(
            {
              credentials: fetchSpeechServicesCredentials
            }
          );

          return options => {
            const speechServicesPonyfill = speechServicesPonyfillFactory(options);

            return {
              SpeechGrammarList: speechServicesPonyfill.SpeechGrammarList,
              SpeechRecognition: speechServicesPonyfill.SpeechRecognition
            };
          };
        }

        window.WebChat.renderWebChat(
          {
            directLine: window.WebChat.createDirectLine({ token }),
            webSpeechPonyfillFactory: await createSpeechRecognitionOnlyPonyfillFactory()
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

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples) -->
