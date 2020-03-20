# Sample - Integrating with Cognitive Services Speech Services

## Description

> Cognitive Services Speech Services support is current in preview. If you encounter any problems, please file us an issue at https://github.com/microsoft/BotFramework-WebChat/issues/.

A simple page with Web Chat integrated with speech-to-text and text-to-speech feature from Cognitive Services Speech Services.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/03.speech/b.cognitive-speech-services-js)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/03.speech/b.cognitive-speech-services-js` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Click on microphone button
-  Say "123"
-  It should recognize as "123."
-  It should speak out the next activities sent from the bot

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

### Goals of this bot

Cognitive Services Speech Services has published a new API to provide speech recognition and synthesis. Web Chat uses the W3C Speech API standard, and supports interfacing Speech Services through an adapter.

## Completed code

### Using authorization token

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Cognitive Services Speech Services using JavaScript</title>
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

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();

        const webSpeechPonyfillFactory = await window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory({
          credentials: fetchSpeechServicesCredentials
        });

        window.WebChat.renderWebChat(
          {
            directLine: window.WebChat.createDirectLine({ token }),
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
