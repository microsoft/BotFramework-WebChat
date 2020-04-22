# Sample - Selecting audio input device

## Description

A simple page with integrated Web Chat, with speech-to-text and text-to-speech functionality that a user can test by selecting different audio devices.

This is an extension of the sample [03.speech/b.cognitive-speech-services-js](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/03.speech/b.cognitive-speech-services-js).

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/03.speech/e.select-audio-input-device)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/03.speech/e.select-audio-input-device` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Click on microphone button
-  Say "Tell me a story."
-  It should be recognized as "Tell me a story."

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Selecting the device

To simplify the sample code, we are selecting an audio input device with the keyword "Audio" in it.

```diff
+ const { deviceId } = (await window.navigator.mediaDevices.enumerateDevices()).find(
+   ({ label }) => ~label.indexOf('Audio')
+ );

  const webSpeechPonyfillFactory = await window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory({
+   audioInputDeviceId: deviceId,
    credentials: fetchSpeechServicesCredentials
  });

  window.WebChat.renderWebChat(
    {
      directLine: window.WebChat.createDirectLine({ token }),
      webSpeechPonyfillFactory
    },
    document.getElementById('webchat')
  );
```

For a comprehensive solution with user-selectable device list, please refer to [`comprehensive.html`](comprehensive.html).

### Direct Line Speech

If you are using Direct Line Speech, you should set `audioInputDeviceId` when calling `createDirectLineSpeechAdapters`.

```diff
  const adapters = await window.WebChat.createDirectLineSpeechAdapters({
+   audioInputDeviceId: selectedAudioInputDeviceId,
    fetchCredentials: fetchDirectLineSpeechCredentials
  });

  window.WebChat.renderWebChat(
    {
      ...adapters
    },
    document.getElementById('webchat')
  );
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
        const { deviceId } = (await window.navigator.mediaDevices.enumerateDevices()).find(
          ({ label }) => ~label.indexOf('Audio')
        );
        const webSpeechPonyfillFactory = await window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory({
          audioInputDeviceId: deviceId,
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
