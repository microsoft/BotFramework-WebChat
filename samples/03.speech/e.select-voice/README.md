# Sample - Selecting voice

## Description

A simple page with Web Chat integrated with speech-to-text and text-to-speech functionality that selects different voices based on the activity to be synthesized.

This is an extension of sample [03.speech/b.cognitive-speech-services-js](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/03.speech/b.cognitive-speech-services-js).

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/03.speech/e.select-voice)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/03.speech/e.select-voice` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Click on microphone button
-  Say "Tell me a story."
-  It should recognize as "Tell me a story."
-  It should speak out two activities sent from the bot. One in English, another Cantonese.

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Selecting voice

To select a different voice for speech synthesis, pass a `selectVoice` function when creating Web Chat.

When Web Chat synthesizes an activity, it will call the `selectVoice` function with a list of voices available and the activity to be synthesized. The code should return the `SpeechSynthesisVoice` object to use for speech synthesis.

In the sample code below, if the activity is for language "zh-HK", we will use a voice with keyword "TracyRUS". Otherwise, it will choose a voice with keyword "JessaNeural" over "Jessa".

```diff
  window.WebChat.renderWebChat({
    directLine: window.WebChat.createDirectLine({ token }),
+   selectVoice: (voices, activity) =>
+     activity.locale === 'zh-HK'
+     ? voices.find(({ name }) => /TracyRUS/iu.test(name))
+     : voices.find(({ name }) => /JessaNeural/iu.test(name)) ||
+       voices.find(({ name }) => /Jessa/iu.test(name)),
    webSpeechPonyfillFactory
  }, document.getElementById('webchat'));
```

## Completed code

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Selecting voice</title>
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
        const directLineTokenResponse = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', {
          method: 'POST'
        });
        const { token } = await directLineTokenResponse.json();
        const webSpeechPonyfillFactory = await window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory({
          credentials: fetchSpeechServicesCredentials
        });

        window.WebChat.renderWebChat(
          {
            directLine: window.WebChat.createDirectLine({ token }),
            selectVoice: (voices, activity) =>
              activity.locale === 'zh-HK'
                ? voices.find(({ name }) => /TracyRUS/iu.test(name))
                : voices.find(({ name }) => /JessaNeural/iu.test(name)) ||
                  voices.find(({ name }) => /Jessa/iu.test(name)),
            webSpeechPonyfillFactory
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

# Further reading

-  [Cognitive Speech Speech Services website](https://azure.microsoft.com/en-us/services/cognitive-services/speech-services/)

## Full list of Web Chat Hosted Samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
