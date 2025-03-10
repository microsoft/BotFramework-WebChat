# Sample - Integrating with Cognitive Services Speech Services and using lexical result

> Cognitive Services Speech Services support is currently in preview. If you encounter any problems, please file us an issue at https://github.com/microsoft/BotFramework-WebChat/issues/.

A simple page with Web Chat integrated with speech-to-text and text-to-speech feature from Cognitive Services Speech Services, with lexical result. This sample makes changes that are based off of the [Cognitive Services Speech Services sample][1].

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/03.speech/c.cognitive-speech-services-with-lexical-result)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/03.speech/c.cognitive-speech-services-with-lexical-result` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Click on microphone button
-  Say 123
-  It should recognize as "one two three", instead of "123."

### Goals of this bot

We'll start by using the [Cognitive Services Speech Services sample][1] as our template.

The main change you will need to make, regardless of whether you are using the subscription key or authorization token, is adding the value `'lexical'` to a `textNormalization` key in your `webSpeechPonyFillFactory` object.

```diff
  const res = await fetch('https://webchat-mockbot.azurewebsites.net/speechservices/token', { method: 'POST' });
  const { region, token: authorizationToken } = await res.json();

  webSpeechPonyfillFactory = await window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory({
-   credentials: fetchSpeechServicesCredentials
+   credentials: fetchSpeechServicesCredentials,
+   textNormalization: 'lexical'
  });
```

# Further reading

-  [Text normalization wiki](https://en.wikipedia.org/wiki/Text_normalization)

## Full list of Web Chat Hosted Samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples)

[1]: ../b.cognitive-speech-services-js/README.md
