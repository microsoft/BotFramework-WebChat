# Sample - Configurable initial silence timeout

## Description

A simple page with integrated Web Chat, with speech-to-text and text-to-speech functionality with a shorter initial silence timeout.

Initial silence timeout is the duration to wait for speech before turning off the microphone.

This is an extension of the sample [03.speech/b.cognitive-speech-services-js](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/03.speech/b.cognitive-speech-services-js).

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/03.speech/i.initial-silence-timeout)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/03.speech/i.initial-silence-timeout` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Click on the microphone button
-  Mute the microphone
-  It should stop recording after 2 seconds of silence

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Customizing initial silence timeout

Initial silence timeout can be configured via the options passed to the `createCognitiveServicesSpeechServicesPonyfillFactory` function.

```diff
  const webSpeechPonyfillFactory = await window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory({
    credentials: fetchSpeechServicesCredentials,
+   initialSilenceTimeout: 2000
  });

  window.WebChat.renderWebChat(
    {
      directLine: window.WebChat.createDirectLine({ token }),
      webSpeechPonyfillFactory
    },
    document.getElementById('webchat')
  );
```

After turning on the microphone and 2 seconds of silence is detected, it would turn off the microphone.

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
        const directLineTokenResponse = await fetch('https://hawo-mockbot4-token-app.ambitiousflower-67725bfd.westus.azurecontainerapps.io/api/token/directline', {
          method: 'POST'
        });
        const { token } = await directLineTokenResponse.json();
        const webSpeechPonyfillFactory = await window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory({
          credentials: fetchSpeechServicesCredentials,
          initialSilenceTimeout: 2000
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

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples)
