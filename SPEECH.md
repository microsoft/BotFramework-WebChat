# Using Cognitive Services Speech Services

This guide is for integrating speech-to-text and text-to-speech functionality of Azure Cognitive Services.

We assume you have already set up a bot and have Web Chat running on a page.

> Sample code in this article are optimized for modern browsers. You may need to use a [transpiler](https://en.wikipedia.org/wiki/Source-to-source_compiler) (e.g. [Babel](https://babeljs.io/)) to target broader range of browsers.

## Browser requirements

In order to use speech functionality in Web Chat, browser would need to provide minimum media capabilities, including recording from microphone and playing audio clips.

Internet Explorer 11 does not meet the basic requirements for both speech recognition and synthesis.

### Speech-to-text requirements

- [WebRTC API support] in browser
   - All modern browsers on desktop and mobile platform
   - With the exception of apps or third-party browsers on iOS
- Must be hosted over HTTPS
- User permission explicitly granted for microphone access

#### Special considerations for iOS

Safari is the only browser that support WebRTC API on iOS.

Chrome, Edge and native apps built using `WKWebView` does not support WebRTC API. Apps based on Cordova/PhoneGap and [React Native WebView](https://github.com/react-native-community/react-native-webview) might need additional plug-ins or custom code to support WebRTC API.

### Text-to-speech requirements

- [Web Audio API support] in browser
   - All modern browsers on desktop and mobile platform

#### Special considerations for Safari on Mac OS and iOS

Safari requires additional permission granted *implicitly* by the user. The user would need to perform an interaction (click/tap/type) before any audio clips can be played during the browser session.

When the user tap on the microphone button for the first time, Web Chat will play a very short and silent audio clip. This will enable Web Chat to play any audio clip synthesized from bot messages.

If you customize Web Chat to perform any text-to-speech operations before any user gestures, Web Chat will be blocked by Safari for audio playback. Thus, bot messages will not be synthesized.

You can present a splash screen with a tap-to-continue button, which would ready the engine by sending an empty utterance to unblock Safari.

## Setting up Web Chat

To use Cognitive Services in Web Chat, you will need to add minimal setup code to wire them up with your subscription.

### Setting up your Azure subscription

You will need to obtain a subscription key for your Azure Cognitive Services subscription. Please follow instructions on [this page][Try Cognitive Services] to obtain a subscription key.

To prevent leaking your subscription key, you should build/host a server which use your subscription key to generate authorization tokens, and only send the authorization token to the client. You can find [more information about authorization token in this article][Authenticate requests to Azure Cognitive Services]. *Never use subscription keys to access your Azure resources in a production environment.*

> To use [new voices powered by deep neural network](https://azure.microsoft.com/en-us/blog/microsoft-s-new-neural-text-to-speech-service-helps-machines-speak-like-people/), you might need to have a subscription in "West US 2" region.

### Integrating Web Chat into your page

This integration code is excerpted from the [sample named "Integrating with Cognitive Services Speech Services"]Sample: [Integrating with Cognitive Services Speech Services].

> To bring more focus to the integration part, we simplified the original sample code by using subscription key instead of authorization token. You should *always use authorization token* for production environment.

```js
const {
  createCognitiveServicesSpeechServicesPonyfillFactory,
  createDirectLine,
  renderWebChat
} = window.WebChat;

renderWebChat({
  directLine: createDirectLine({
    secret: 'YOUR_DIRECT_LINE_SECRET'
  }),
  language: 'en-US',
  webSpeechPonyfillFactory: await createCognitiveServicesSpeechServicesPonyfillFactory({
    region: 'YOUR_REGION',
    subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
  })
}, document.getElementById('webchat'));
```

After adding the ponyfill factory, you should be able to see a microphone button in Web Chat.

## Additional features

These features are for improving the overall user experiences while using speech in Web Chat.

- [Selecting voice](#selecting-voice)
- [Custom Speech](#custom-speech)
- [Custom Voice](#custom-voice)
- [Text-to-speech audio format](#text-to-speech-audio-format)
- [Text normalization options](#text-normalization-options)
- [Disabling telemetry](#disabling-telemetry)
- [Using authorization token](#using-authorization-token)
- [Using two subscription keys for speech-to-text and text-to-speech](#using-two-subscription-keys-for-speech-to-text-and-text-to-speech)

### Selecting voice

Different voice can be selected based on the synthesizing activity.

In the following code, voice is selected based on the language of the synthesizing activity. If the activity is in Cantonese (zh-HK), we will select the voice with keyword "TracyRUS". Otherwise, we will select the voice with keyword "Jessa24kRUS".

```diff
  const {
    createCognitiveServicesSpeechServicesPonyfillFactory,
    createDirectLine,
    renderWebChat
  } = window.WebChat;

  renderWebChat({
    directLine: createDirectLine({
      secret: 'YOUR_DIRECT_LINE_SECRET'
    }),
    language: 'en-US',
+   selectVoice: (voices, activity) => {
+     if (activity.locale === 'zh-HK') {
+       return voices.find(({ name }) => /TracyRUS/iu.test(name));
+     } else {
+       return voices.find(({ name }) => /Jessa24kRUS/iu.test(name));
+     }
+   }
    webSpeechPonyfillFactory: await createCognitiveServicesSpeechServicesPonyfillFactory({
      region: 'YOUR_REGION',
      subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
    })
  }, document.getElementById('webchat'));
```

### Custom Speech

Custom Speech is a trained recognition model to improve recognition of words that are not in the default recognition model. For example, you can use it to improve accuracy when recognizing trademarks or name of person.

First, you need to set up a Custom Speech project. Please follow [this article to create a new Custom Speech project][What is Custom Speech].

After your Custom Speech project is set up and a model is published to a deployment endpoint, in the "Deployment" tab, save the "Endpoint ID".

You will then need to modify your integration code as below.

```diff
  renderWebChat({
    directLine: createDirectLine({
      secret: 'YOUR_DIRECT_LINE_SECRET'
    }),
    language: 'en-US',
    webSpeechPonyfillFactory: await createCognitiveServicesSpeechServicesPonyfillFactory({
      region: 'YOUR_REGION',
+     speechRecognitionEndpointId: 'YOUR_ENDPOINT_ID',
      subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
    })
  }, document.getElementById('webchat'));
```

### Custom Voice

Custom Voice is a trained synthesis model for providing your user with an unique synthesized voice when performing text-to-speech.

First, you need to set up a Custom Voice project. Please follow [this article to create a new Custom Voice project][Get started with Custom Voice].

After your Custom Voice project is set up and a model is published to a deployment endpoint, in the "Deployment" tab, save the "Model / Voice name" and "Endpoint URL".

You will then need to modify your integration code as below. The `selectVoice` function will be used to choose which trained synthesis model to use.

```diff
  renderWebChat({
    directLine: createDirectLine({
      secret: 'YOUR_DIRECT_LINE_SECRET'
    }),
    language: 'en-US',
+   selectVoice: () => ({ voiceURI: 'YOUR_VOICE_MODEL_NAME' }),
    webSpeechPonyfillFactory: await createCognitiveServicesSpeechServicesPonyfillFactory({
      region: 'YOUR_REGION',
+     speechSynthesisDeploymentId: 'YOUR_DEPLOYMENT_ID',
      subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
    })
  }, document.getElementById('webchat'));
```

> Note: if you send SSML instead of plain text, make sure the voice model is correctly selected in your SSML.

### Text-to-speech audio format

To conserve bandwidth, you can set the text-to-speech audio format to one that consume less bandwidth by modifying your integration code as below.

```diff
  renderWebChat({
    directLine: createDirectLine({
      secret: 'YOUR_DIRECT_LINE_SECRET'
    }),
    language: 'en-US',
    webSpeechPonyfillFactory: await createCognitiveServicesSpeechServicesPonyfillFactory({
      region: 'YOUR_REGION',
+     speechSynthesisOutputFormat: 'audio-24khz-48kbitrate-mono-mp3',
      subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
    })
  }, document.getElementById('webchat'));
```

Please refer to [this article for list of supported audio formats](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-text-to-speech#audio-outputs).

### Text normalization options

Text normalization is an option to modify how the speech engine normalize texts. For example, when the user say, "I would like to order 2 4-piece of chicken nuggets." It could be recognized as "two four piece" (default) or "2 four piece" (inverse text normalization, or ITN).

You can read more about [various text normalization options in this article](https://github.com/MicrosoftDocs/azure-docs/blob/master/articles/cognitive-services/Speech-Service/rest-speech-to-text.md#response-parameters).

To select different text normalization option, you will need to modify your integration code as below.

```diff
  renderWebChat({
    directLine: createDirectLine({
      secret: 'YOUR_DIRECT_LINE_SECRET'
    }),
    language: 'en-US',
    webSpeechPonyfillFactory: await createCognitiveServicesSpeechServicesPonyfillFactory({
      region: 'YOUR_REGION',
      subscriptionKey: 'YOUR_SUBSCRIPTION_KEY',
+     textNormalization: 'itn'
    })
  }, document.getElementById('webchat'));
```

> Supported text normalization options are `"display"` (default), `"itn"`, `"lexical"`, and `"maskeditn"`.

### Disabling telemetry

By default, [Azure Cognitive Services will collect telemetry for service performance](https://github.com/Microsoft/cognitive-services-speech-sdk-js#data--telemetry). If you prefer to disable telemetry, please modify the code as below.

```diff
  renderWebChat({
    directLine: createDirectLine({
      secret: 'YOUR_DIRECT_LINE_SECRET'
    }),
    language: 'en-US',
    webSpeechPonyfillFactory: await createCognitiveServicesSpeechServicesPonyfillFactory({
+     enableTelemtry: false,
      region: 'YOUR_REGION',
      subscriptionKey: 'YOUR_SUBSCRIPTION_KEY',
    })
  }, document.getElementById('webchat'));
```

### Using authorization token

For simplicity, in our sample, we are using subscription key. If you need to use authorization token, you can pass a `Promise` function to the `authorizationToken` property. And the function could potentially be a network call to your token server.

```diff
  async function fetchAuthorizationToken() {
    const res = await fetch('/api/speechtoken');

    if (res.ok) {
      return await res.text();
    } else {
      throw new Error('Failed to retrieve authorization token for Cognitive Services.');
    }
  }

  renderWebChat({
    directLine: createDirectLine({
      secret: 'YOUR_DIRECT_LINE_SECRET'
    }),
    language: 'en-US',
    webSpeechPonyfillFactory: await createCognitiveServicesSpeechServicesPonyfillFactory({
+     // Note we are passing the function, but not the result of the function call, there is no () appended to it.
+     // This function will be called every time the authorization token is being used.
+     authorizationToken: fetchAuthorizationToken,
      region: 'YOUR_REGION',
-     subscriptionKey: 'YOUR_SUBSCRIPTION_KEY',
    })
  }, document.getElementById('webchat'));
```

The function `fetchAuthorizationToken` will be called *every time* a token is needed. If simplicity, token caching is not provided in this sample code. You should add caching based on the validity of the token.

### Using two subscription keys for speech-to-text and text-to-speech

In some cases, you may be using two different Cognitive Services subscriptions, one for speech-to-text and another one for text-to-speech. You could create two ponyfills and combine together to form a hybrid ponyfill.

```diff
+ const speechToTextPonyfillFactory = await createCognitiveServicesSpeechServicesPonyfillFactory({
+   region: 'YOUR_STT_REGION',
+   subscriptionKey: 'YOUR_STT_SUBSCRIPTION_KEY',
+ });

+ const textToSpeechPonyfillFactory = await createCognitiveServicesSpeechServicesPonyfillFactory({
+   region: 'YOUR_TTS_REGION',
+   subscriptionKey: 'YOUR_TTS_SUBSCRIPTION_KEY',
+ });

  renderWebChat({
    directLine: createDirectLine({
      secret: 'YOUR_DIRECT_LINE_SECRET'
    }),
    language: 'en-US',
-   webSpeechPonyfillFactory: await createCognitiveServicesSpeechServicesPonyfillFactory({
-     region: 'YOUR_REGION',
-     subscriptionKey: 'YOUR_SUBSCRIPTION_KEY',
-   })
    webSpeechPonyfillFactory: options => {
      const { SpeechGrammarList, SpeechRecognition } = speechToTextPonyfillFactory(options);
      const { speechSynthesis, SpeechSynthesisUtterance } = textToSpeechPonyfillFactory(options);

      return {
        SpeechGrammarList,
        SpeechRecognition,
        speechSynthesis,
        SpeechSynthesisUtterance
      };
    }
  }, document.getElementById('webchat'));
```

> Note: it is correct that `speechSynthesis` is in camel-casing, while others are in Pascal-casing.

Using this approach, you can also combine two polyfills of different types. For example, speech recognition powered by Cognitive Services with browser-supported speech synthesis. You can refer to [this sample for the hybrid speech approach][Sample: Using hybrid speech engine].

## Related articles

- [Try Cognitive Services]
- [Web Audio API support]
- [WebRTC API Support]
- [Get started with Custom Voice]
- [What is Custom Speech]
- [Sample: Integrating with Cognitive Services Speech Services]
- [Sample: Using hybrid speech engine]

[Authenticate requests to Azure Cognitive Services]: https://docs.microsoft.com/en-us/azure/cognitive-services/authentication
[Get started with Custom Voice]: https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/how-to-custom-voice
[Sample: Integrating with Cognitive Services Speech Services]: https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/06.c.cognitive-services-speech-services-js
[Try Cognitive Services]: https://azure.microsoft.com/en-us/try/cognitive-services/my-apis/#speech
[Sample: Using hybrid speech engine]: https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/06.f.hybrid-speech
[Web Audio API support]: https://caniuse.com/#feat=audio-api
[WebRTC API Support]: https://caniuse.com/#feat=rtcpeerconnection
[What is Custom Speech]: (https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/how-to-custom-speech)
