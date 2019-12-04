# Using Cognitive Services Speech Services

> For Direct Line Speech, please refer to [DIRECT_LINE_SPEECH.md](https://github.com/microsoft/BotFramework-WebChat/blob/master/DIRECT_LINE_SPEECH.md).

This guide is for integrating speech-to-text and text-to-speech functionality of Azure Cognitive Services.

We assume you have already set up a bot and have Web Chat running on a page.

> Sample code in this article is optimized for modern browsers. You may need to use a [transpiler](https://en.wikipedia.org/wiki/Source-to-source_compiler) (e.g. [Babel](https://babeljs.io/)) to target a broader range of browsers.

## Support matrix

<table>
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th colspan="2">Chrome/Edge<br />and Firefox<br />on desktop</th>
      <th colspan="2">Chrome<br />on Android</th>
      <th colspan="2">Safari<br />on macOS/iOS</th>
      <th colspan="2"><a href="https://developer.android.com/reference/android/webkit/WebView">Web View<br />on Android</a></th>
      <th colspan="2"><a href="https://developer.apple.com/documentation/webkit/wkwebview">Web View<br />on iOS</a></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>STT</td>
      <td>Basic recognition</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td><a href="#custom-speech">Custom Speech</a></td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td><a href="#text-normalization-options">Text normalization options</a></td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td>Abort recognition</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td>Interims</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td>Dynamic priming</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td>Reference grammar ID</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td>Select language at initialization</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td>Select language on-the-fly</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td><a href="#using-input-hint">Input hint</a></td>
      <th>✔</th><td>4.5</td>
      <th>✔</th><td>4.5</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.5</td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td>Select input device</td>
      <th>❌</th><td><a href="#notes-3"><sup>*3</sup></a></td>
      <th>❌</th><td><a href="#notes-3"><sup>*3</sup></a></td>
      <th>❌</th><td><a href="#notes-3"><sup>*3</sup></a></td>
      <th>❌</th><td><a href="#notes-3"><sup>*3</sup></a></td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td>Basic synthesis using text</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td><a href="#using-speech-synthesis-markup-language">Speech Synthesis Markup Language</a></td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td><a href="#custom-voice">Custom Voice</a></td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td><a href="#selecting-voice">Selecting voice/pitch/rate/volume</a></td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td><a href="#text-to-speech-audio-format">Text-to-speech audio format</a></td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td>Stripping text from Markdown</td>
      <th>✔</th><td>4.5</td>
      <th>✔</th><td>4.5</td>
      <th>✔</th><td>4.5</td>
      <th>✔</th><td>4.5</td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td>Override using "speak" property</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td>Adaptive Cards using "speak" property</td>
      <th>✔</th><td>4.5</td>
      <th>✔</th><td>4.5</td>
      <th>✔</th><td>4.5</td>
      <th>✔</th><td>4.5</td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td>Interrupt synthesis when clicking on microphone button (<a href="https://github.com/microsoft/BotFramework-WebChat/issues/2428">Bug</a>) (<a href="https://github.com/microsoft/BotFramework-WebChat/pull/2429">PR</a>)</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>✔</th><td>4.6</td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td>Synthesize activity with multiple attachments</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>✔</th><td>4.2</td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
  </tbody>
</table>

### Notes

1. <a name="notes-1"></a>[Web View on iOS](https://developer.apple.com/documentation/webkit/wkwebview) is not a full browser. It does not have audio recording capabilities, which is required for Cognitive Services
2. <a name="notes-2"></a>As speech recognition is not working (see above), speech synthesis is not tested
3. <a name="notes-3"></a>Cognitive Services currently has a bug on selecting a different device for audio recording
   -  Currently blocked by https://github.com/microsoft/cognitive-services-speech-sdk-js/issues/96
   -  Tracking bug at https://github.com/microsoft/BotFramework-WebChat/issues/2481

## Requirements

In order to use the speech functionality in Web Chat, the browser needs to provide minimal media capabilities, including recording from microphone and playing audio clips.

Internet Explorer 11 does not meet the basic requirements for both speech recognition and speech synthesis.

### Speech-to-text requirements

-  Browser must [support WebRTC API][webrtc api support]
   -  Available on most modern browsers on desktop and mobile platform
   -  WebRTC will not work on third-party apps or browsers on iOS
-  Web page must be hosted over HTTPS
-  User must explicitly grant permission for microphone access

#### Special considerations for iOS

Safari is the only browser that supports WebRTC API on iOS.

Chrome, Edge and native apps built using `WKWebView` do not support WebRTC API. Apps based on Cordova/PhoneGap and [React Native WebView](https://github.com/react-native-community/react-native-webview) might need additional plugins or custom code to support WebRTC API.

### Text-to-speech requirements

-  Browser must [support Web Audio API][web audio api support]
   -  Available on all modern browsers on desktop and mobile platform

#### Special considerations for Safari on macOS and iOS

Safari requires additional permission granted _explicitly_ by the user. The user needs to perform an interaction (click/tap/type) before any audio clips can be played during the browser session.

When the user taps on the microphone button for the first time, Web Chat will play a very short and silent audio clip. This will enable Web Chat to play any audio clip synthesized from bot messages.

If you customize Web Chat to perform any text-to-speech operations before user gestures, Web Chat will be blocked by Safari for audio playback. Thus, bot messages will not be synthesized.

You can present a splash screen with a tap-to-continue button, which will ready the engine by sending an empty utterance to unblock Safari.

## Setting up Web Chat

To use Cognitive Services in Web Chat, you will need to add minimal setup code to set up Web Chat with your Cognitive Services subscription.

### Setting up your Azure subscription

You will need to obtain a subscription key for your Azure Cognitive Services subscription. Please follow instructions on [this page][try cognitive services] to obtain a subscription key.

To prevent exposing your subscription key, you should build/host a server that uses your subscription key to generate authorization tokens, and only send the authorization token to the client. You can find more information about authorization tokens on the [Cognitive Services Authentication documentation][authenticate requests to azure cognitive services]. _Never use subscription keys to access your Azure resources in a production environment._

> To use [new voices powered by deep neural network](https://azure.microsoft.com/en-us/blog/microsoft-s-new-neural-text-to-speech-service-helps-machines-speak-like-people/), you might need to have a subscription in "West US 2" region or [other supported regions](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/regions#standard-and-neural-voices).

### Integrating Web Chat into your page

This integration code is excerpted from the sample named ["Integrating with Cognitive Services Speech Services"][sample: integrating with cognitive services speech services].

> To bring more focus to the integration part, we simplified the original sample code by using subscription key instead of authorization token. You should _always use authorization token_ for production environment.

```js
const {
   createCognitiveServicesSpeechServicesPonyfillFactory,
   createDirectLine,
   renderWebChat
} = window.WebChat;

renderWebChat(
   {
      directLine: createDirectLine({
         secret: 'YOUR_DIRECT_LINE_SECRET'
      }),
      language: 'en-US',
      webSpeechPonyfillFactory: await createCognitiveServicesSpeechServicesPonyfillFactory(
         {
            region: 'YOUR_REGION',
            subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
         }
      )
   },
   document.getElementById('webchat')
);
```

After adding the ponyfill factory, you should be able to see the microphone button in Web Chat, which indicates that speech is enabled.

## Additional features

These features are for improving the overall user experience while using speech in Web Chat.

-  [Using Speech Synthesis Markup Language](#using-speech-synthesis-markup-language)
-  [Using input hint](#using-input-hint)
-  [Selecting voice](#selecting-voice)
-  [Custom Speech](#custom-speech)
-  [Custom Voice](#custom-voice)
-  [Text-to-speech audio format](#text-to-speech-audio-format)
-  [Text normalization options](#text-normalization-options)
-  [Disabling telemetry](#disabling-telemetry)
-  [Using authorization token](#using-authorization-token)
-  [Using two subscription keys for speech-to-text and text-to-speech](#using-two-subscription-keys-for-speech-to-text-and-text-to-speech)

### Using Speech Synthesis Markup Language

Instead of synthesizing text, Web Chat can also synthesize [Speech Synthesis Markup Language] (or SSML). [Cognitive Services supports SSML 1.0 with "mstts" extensions](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-synthesis-markup).

When the bot sends the activity, include the SSML in the `speak` property.

```xml
<speak
  version="1.0"
  xmlns="https://www.w3.org/2001/10/synthesis"
  xmlns:mstts="https://www.w3.org/2001/mstts"
  xml:lang="en-US"
>
  <voice name="en-US-JessaNeural">
    <mstts:express-as type="cheerful">That'd be just amazing!</mstts:express-as>
  </voice>
  <voice name="ja-JP-Ayumi-Apollo">
    <prosody pitch="+150%">素晴らしい!</prosody>
  </voice>
</speak>
```

> The SSML code snippet above is using neural voice "JessaNeural" for expression, which is only supported in some regions.

With "mstts" extension, you can also [add speaking style](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-synthesis-markup#adjust-speaking-styles) (e.g. cheerful) and [background audio](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-synthesis-markup#add-background-audio) to your synthesized speech.

### Using input hint

The bot can set input hint when sending activity to the user to indicate whether the bot is anticipating user input. This can be used re-open the microphone if the last message was sent through microphone. You can set it to either `expectingInput`, `acceptingInput`, and `ignoringInput`. If it is not defined, it will default to `acceptingInput`.

-  `"expectingInput"`: Web Chat will open the microphone after the bot's message is spoken and the last message was sent through microphone
-  `"acceptingInput"`: Web Chat will do nothing after the bot's message is spoken
-  `"ignoringInput"`: Web Chat will explicitly close the microphone

> Note: `expectingInput` is currently not working on Safari for both macOS and iOS.

For more details, please follow this article on [adding input hints to messages][add input hints to messages].

#### Input hint behavior before 4.5.0

In issue [#2022](https://github.com/microsoft/BotFramework-WebChat/issues/2022), it was brought to the Web Chat team's attention that the speech behavior of v3 and v4 of Web Chat do not match. In the 4.5.0 release, the expected behavior of a speech bot has been modified in order to bring parity to v3 behavior regarding [input hint](https://docs.microsoft.com/en-us/azure/bot-service/dotnet/bot-builder-dotnet-add-input-hints?view=azure-bot-service-3.0). This means the following:

-  Expecting input will now be respected by Web Chat and open the microphone during a speech conversation. This is assuming that the user has given permission for the browser to use the mic.
-  Accepting input **will no longer** open the mic after the bot has responded to a speech activity from the user. Instead, the user will have to press the microphone button again in order to further interact with the bot.
-  Ignoring input will continue to **not** open the mic after a speech activity has been sent from the bot.

### Selecting voice

Different voices can be selected based on the synthesizing activity.

By default, we will use the following order to determine which voice to use. If available, we prioritize deep neural network-based voices over traditional voices.

-  Locale specified in the activity
-  Display language of Web Chat
-  Browser language
-  English (US)
-  The first available voice

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

Custom Speech is a trained recognition model that improves recognition of words that are not in the default recognition model. For example, you can use it to improve accuracy when recognizing trademark words or the name of a person.

First, you need to set up a Custom Speech project. Please follow the article on [creating a new Custom Speech project][what is custom speech].

After your Custom Speech project is set up and a model is published to a deployment endpoint, in the "Deployment" tab, save your "Endpoint ID".

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

First, you need to set up a Custom Voice project. Please follow the article on [creating a new Custom Voice project][get started with custom voice].

After your Custom Voice project is set up and a model is published to a deployment endpoint, in the "Deployment" tab, save the "Model / Voice name" and the value of "deploymentId" inside the "Endpoint URL" field.

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

To conserve bandwidth, you can set the text-to-speech audio format to one that consumes less bandwidth by modifying your integration code as below:

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

Please refer to the following list of [supported audio formats](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-text-to-speech#audio-outputs).

### Text normalization options

Text normalization is an ability to modify how the speech engine normalizes text. For example, when the user says, "I would like to order 2 4-piece chicken nuggets." It could be recognized as "two four piece" (default) or "2 four piece" (inverse text normalization, or ITN).

You can read more about [various text normalization options](https://github.com/MicrosoftDocs/azure-docs/blob/master/articles/cognitive-services/Speech-Service/rest-speech-to-text.md#response-parameters).

To select different text normalization options, you will need to modify your integration code as below:

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

By default, [Azure Cognitive Services will collect telemetry for service performance](https://github.com/Microsoft/cognitive-services-speech-sdk-js#data--telemetry). If you prefer to disable telemetry, please modify the code as below:

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

This sample uses a subscription key for simplicity. If you need to use authorization token, you can pass a `Promise` function to the `authorizationToken` property. The function could potentially be a network call to your token server.

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
+     // Note we are passing the function, not the result of the function call, as there is no () appended to it.
+     // This function will be called every time the authorization token is being used.
+     authorizationToken: fetchAuthorizationToken,
      region: 'YOUR_REGION',
-     subscriptionKey: 'YOUR_SUBSCRIPTION_KEY',
    })
  }, document.getElementById('webchat'));
```

The function `fetchAuthorizationToken` will be called _every time_ a token is needed. For simplicity, token caching is not provided in this sample code. You should add caching based on the validity of the token.

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
+   webSpeechPonyfillFactory: options => {
+     const { SpeechGrammarList, SpeechRecognition } = speechToTextPonyfillFactory(options);
+     const { speechSynthesis, SpeechSynthesisUtterance } = textToSpeechPonyfillFactory(options);
+
+     return {
+       SpeechGrammarList,
+       SpeechRecognition,
+       speechSynthesis,
+       SpeechSynthesisUtterance
+     };
+   }
  }, document.getElementById('webchat'));
```

> Note: it is correct that `speechSynthesis` is in camel-casing, while others are in Pascal-casing.

Using this approach, you can also combine two polyfills of different types. For example, speech recognition powered by Cognitive Services with browser-supported speech synthesis. You can refer to our Web Chat sample [on hybrid speech][sample: using hybrid speech engine] to learn more.

## Related articles

-  [Try Cognitive Services]
-  [List of browsers which support Web Audio API][web audio api support]
-  [List of browsers which support WebRTC API][webrtc api support]
-  [Speech Synthesis Markup Language (SSML)][speech synthesis markup language]
-  [Add input hints to messages]
-  [Get started with Custom Voice]
-  [What is Custom Speech]
-  [Sample: Integrating with Cognitive Services Speech Services]
-  [Sample: Using hybrid speech engine]

[authenticate requests to azure cognitive services]: https://docs.microsoft.com/en-us/azure/cognitive-services/authentication
[get started with custom voice]: https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/how-to-custom-voice
[sample: integrating with cognitive services speech services]: https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/06.c.cognitive-services-speech-services-js
[sample: using hybrid speech engine]: https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/06.f.hybrid-speech
[speech synthesis markup language]: https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-synthesis-markup
[try cognitive services]: https://azure.microsoft.com/en-us/try/cognitive-services/my-apis/#speech
[web audio api support]: https://caniuse.com/#feat=audio-api
[webrtc api support]: https://caniuse.com/#feat=rtcpeerconnection
[what is custom speech]: https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/how-to-custom-speech
[add input hints to messages]: https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-connector-add-input-hints?view=azure-bot-service-4.0
