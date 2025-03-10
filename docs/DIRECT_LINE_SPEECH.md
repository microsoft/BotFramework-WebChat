# Using Direct Line Speech

> For Cognitive Services Speech Services, please refer to [`SPEECH.md`](https://github.com/microsoft/BotFramework-WebChat/blob/main/docs/SPEECH.md).

This guide is for using Web Chat with chat and speech functionality provided by the [Direct Line Speech protocol](https://docs.microsoft.com/en-us/azure/cognitive-services/Speech-Service/direct-line-speech).

We assume you have already set up a Direct Line Speech bot and have Web Chat running on your webpage.

> Sample code in this article is optimized for modern browsers. You may need to use a [transpiler](https://en.wikipedia.org/wiki/Source-to-source_compiler) (e.g. [Babel](https://babeljs.io/)) to target a broader range of browsers.

## What is Direct Line Speech?

Direct Line Speech is designed for Voice Assistant scenario. For example, smart display, automotive dashboard, navigation system with low-latency requirement on _single-page application_ and _progressive web apps_ (PWA). These apps usually are made with highly-customized UI and do not show conversation transcripts.

You can look at our sample [06.recomposing-ui/b.speech-ui](https://microsoft.github.io/BotFramework-WebChat/samples/06.recomposing-ui/b.speech-ui) and [06.recomposing-ui/c.smart-display](https://microsoft.github.io/BotFramework-WebChat/samples/06.recomposing-ui/c.smart-display) for target scenarios.

Direct Line Speech is not recommended to use on traditional websites where its primary UI is transcript-based.

## Support matrix

<table>
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th colspan="2">Chrome/Microsoft Edge<br />and Firefox<br />on desktop</th>
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
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td><a href="#custom-speech">
      Custom Speech</a> (<a href="#custom-speech-is-not-supported">Details</a>)</td>
      <th>✔</th><td></td>
      <th>✔</th><td></td>
      <th>✔</th><td></td>
      <th>✔</th><td></td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td>
      Interims/Partial Recognition
      </td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td>Select language at initialization</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td><a href="#using-input-hint">Input hint</a></td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
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
      <td>STT</td>
      <td>Dynamic priming (<a href="#dynamic-priming-is-not-supported">Details</a>)</td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td>Reference grammar ID (<a href="#reference-grammar-id-is-not-supported">Details</a>)</td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td>Select language on-the-fly (<a href="#speech-recognition-language-cannot-be-switched-on-the-fly">Details</a>)</td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td><a href="#text-normalization-options">Text normalization options</a> (<a href="#text-normalization-option-is-not-supported">Details</a>)</td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td>Abort recognition (<a href="#abort-recognition-is-not-supported">Details</a>)</td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td>Basic synthesis using text</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td><a href="#using-speech-synthesis-markup-language">Speech Synthesis Markup Language</a></td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td><a href="#custom-voice">Custom Voice</a> (<a href="#custom-voice-is-not-supported">Details</a>)</td>
      <th>✔</th><td></td>
      <th>✔</th><td></td>
      <th>✔</th><td></td>
      <th>✔</th><td></td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td><a href="#selecting-voice">Selecting voice/pitch/rate/volume</a></td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td>Override using "speak" property</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td>Interrupt synthesis when clicking on microphone button</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td><a href="#text-to-speech-audio-format">Text-to-speech audio format</a> (<a href="#synthesis-audio-quality-is-not-configurable">Details</a>)</td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td>Stripping text from Markdown (<a href="#alternative-for-markdown">Details</a>)</td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td>Adaptive Cards using "speak" property (<a href="#attachments-are-not-synthesized">Details</a>)</td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td>Synthesize activity with multiple attachments (<a href="#attachments-are-not-synthesized">Details</a>)</td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
  </tbody>
</table>

### Notes

1. <a name="notes-1"></a>[Web View on iOS](https://developer.apple.com/documentation/webkit/wkwebview) is not a full browser. It does not have audio recording capabilities, which is required for Cognitive Services
2. <a name="notes-2"></a>As speech recognition is not working (see above), speech synthesis is not tested
3. <a name="notes-3"></a>Cognitive Services currently has a bug on selecting a different device for audio recording
   -  Fixed in [cognitive-services-speech-sdk-js#96](https://github.com/microsoft/cognitive-services-speech-sdk-js/issues/96)
   -  Tracking bug at [#2481](https://github.com/microsoft/BotFramework-WebChat/issues/2481)
   -  This is fixed in [`microsoft-cognitiveservices-speech-sdk@>=1.10.0`](https://www.npmjs.com/package/microsoft-cognitiveservices-speech-sdk/v/1.10.0)

## Requirements

Direct Line Speech does not support Internet Explorer 11. It requires modern browser media capabilities that are not available in IE11.

Direct Line Speech shares the same requirements as Cognitive Services Speech Services. Please refer to [`SPEECH.md`](https://github.com/microsoft/BotFramework-WebChat/blob/main/docs/SPEECH.md#requirements).

## How to get started

Before start, please create corresponding Azure resources. You can follow [this tutorial for enabling voice in your bot](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/tutorial-voice-enable-your-bot-speech-sdk). You do not need to follow the steps for creating C# client, you will replace the client with Web Chat.

Please look at our sample `03.speech/a.direct-line-speech` to embedding Web Chat on your web app via Direct Line Speech channel.

> You will need to use Web Chat 4.7 or higher for Direct Line Speech.

After setting up Direct Line Speech on Azure Bot Services, there are two steps for using Direct Line Speech:

-  [Retrieve your Direct Line Speech credentials](#retrieve-your-direct-line-speech-credentials)
-  [Render Web Chat using Direct Line Speech adapters](#render-web-chat-using-direct-line-speech-adapters)

### Retrieve your Direct Line Speech credentials

> You should always use authorization token when authorizing with Direct Line Speech.

To secure the conversation, you will need to set up a REST API to generate the credentials. When called, it will return authorization token and region for your Direct Line Speech channel.

In the following code snippets, we assume sending a HTTP POST request to https://webchat-mockbot-streaming.azurewebsites.net/speechservices/token will return with a JSON with `authorizationToken` and `region`.

<!-- prettier-ignore-start -->
```js
const fetchCredentials = async () => {
  const res = await fetch('https://webchat-mockbot-streaming.azurewebsites.net/speechservices/token', {
    method: 'POST'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch authorization token and region.');
  }

  const { authorizationToken, region } = await res.json();

  return { authorizationToken, region };
};
```
<!-- prettier-ignore-end -->

> Since the token expire after 10 minutes, it is advised to cache this token for 5 minutes. You can use either HTTP header `Cache-Control` on the REST API, or implement a memoization function in the browser.

### Render Web Chat using Direct Line Speech adapters

After you have the `fetchCredentials` function set up, you can pass it to `createDirectLineSpeechAdapters` function. This function will return a set of adapters that is used by Web Chat. It includes DirectLineJS adapter and Web Speech adapter.

<!-- prettier-ignore-start -->
```js
const adapters = await window.WebChat.createDirectLineSpeechAdapters({
  fetchCredentials
});

window.WebChat.renderWebChat(
  {
    ...adapters
  },
  document.getElementById('webchat')
);
```
<!-- prettier-ignore-end -->

> The code above will requires transpilation for browser which do not support the [spread operator](https://caniuse.com/#feat=mdn-javascript_operators_spread_spread_in_destructuring).

## Supported options

These are the options to pass when calling `createDirectLineSpeechAdapters`.

<table>
  <thead>
    <tr>
      <td>Name</td>
      <td>Type</td>
      <td>Default</td>
      <td>Description</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <code>audioConfig</code>
      </td>
      <td>
        <code>
          <a href="https://github.com/microsoft/cognitive-services-speech-sdk-js/blob/master/src/sdk/Audio/AudioConfig.ts">AudioConfig</a>
        </code>
      </td>
      <td>
        <code>
          <a href="https://github.com/microsoft/cognitive-services-speech-sdk-js/blob/master/src/sdk/Audio/AudioConfig.ts">fromDefaultMicrophoneInput()</a>
        </code>
      </td>
      <td>
        Audio input object to use in Speech SDK.
      </td>
    </tr>
    <tr>
      <td>
        <code>audioContext</code>
      </td>
      <td>
        <code>
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/AudioContext">AudioContext</a>
        </code>
      </td>
      <td>
        <code>window.AudioContext || window.webkitAudioContext</code>
      </td>
      <td>
        <code>AudioContext</code> used for constructing audio graph used for speech synthesis. Can be used to prime the Web Audio engine or as a ponyfill.
      </td>
    </tr>
    <tr>
      <td>
        <code>audioInputDeviceId</code>
      </td>
      <td>
        <code>string</code>
      </td>
      <td>
        <code>undefined</code>
      </td>
      <td>Device ID of the audio input device. Ignored if <code>audioConfig</code> is specified.</td>
    </tr>
    <tr>
      <td>
        <code>fetchCredentials</code>
      </td>
      <td>
        <code>
          <a href="#directlinespeechcredentials">DirectLineSpeechCredentials</a>
        </code>
      </td>
      <td>(Required)</td>
      <td>
        An asynchronous function to fetch credentials, including either hostname or region, and either authorization token or subscription key.
      </td>
    </tr>
    <tr>
      <td>
        <code>speechRecognitionLanguage</code>
      </td>
      <td>
        <code>string</code>
      </td>
      <td>
        <pre>window?.navigator?.language ||<br />'en-US'</pre>
      </td>
      <td>Language used for speech recognition</td>
    </tr>
    <tr>
      <td>
        <code>userID</code>
      </td>
      <td>
        <code>string</code>
      </td>
      <td>(A random ID)</td>
      <td>User ID for all outgoing activities.</td>
    </tr>
    <tr>
      <td>
        <code>username</code>
      </td>
      <td>
        <code>string</code>
      </td>
      <td>
        <code>undefined</code>
      </td>
      <td>Username for all outgoing activities.</td>
    </tr>
  </tbody>
</table>

### `DirectLineSpeechCredentials`

```js
type DirectLineSpeechCredentials = {
  authorizationToken: string,
  region: string
} || {
  authorizationToken: string,
  directLineSpeechHostname: string
} || {
  region: string,
  subscriptionKey: string
} || {
  directLineSpeechHostname: string,
  subscriptionKey: string
}
```

For public clouds, we recommend using the `region` option, such as `"westus2"`.

For sovereign clouds, you should specify the hostname in FQDN through `directLineSpeechHostname` option, such as `"virginia.convai.speech.azure.us"`.

## Known issues

### Differences in `conversationUpdate` behaviors

> Please vote on [this bug](https://github.com/microsoft/BotFramework-WebChat/issues/XXX) if this behavior is not desirable.

You can specify user ID when you instantiate Web Chat.

-  If you specify user ID
   -  `conversationUpdate` activity will be send on connect and every reconnect. And with your user ID specified in the `membersAdded` field.
   -  All `message` activities will be sent with your user ID in `from.id` field.
-  If you do not specify user ID
   -  `conversationUpdate` activity will be send on connect and every reconnect. The `membersAdded` field will have an user ID of empty string.
   -  All `message` activities will be sent with a randomized user ID
      -  The user ID is kept the same across reconnections

### Connection idle and reconnection

> Please vote on [this bug](https://github.com/microsoft/BotFramework-WebChat/issues/2677) if this behavior is not desirable.

After idling for 5 minutes, the Web Socket connection will be disconnected. If the client is still active, we will try to reconnect. On every reconnect, a `conversationUpdate` activity will be sent.

### Text normalization option is not supported

> Please vote on [this bug](https://github.com/microsoft/BotFramework-WebChat/issues/2678) if this behavior is not desirable.

Currently, there is no options to specify different text normalization options, including inverse text normalization (ITN), masked ITN, lexical, and display.

### Page refresh will start a new conversation

> Please vote on [this bug](https://github.com/microsoft/BotFramework-WebChat/issues/2679) if this behavior is not desirable.

Web Chat do not persist conversation information (conversation ID and connection ID). Thus, on every page refresh, the conversation will be created as a new conversation.

### Conversation history are not stored and resent

Direct Line Speech is not targeting a transcript-based experience. Thus, our servers will no longer store conversation history. We do not plan to support this feature.

### No additional data can be piggybacked on speech recognition

> Please vote on [this bug](https://github.com/microsoft/BotFramework-WebChat/issues/2680) if this behavior is not desirable.

When using text-based experience, we allow developers to piggyback additional information to outgoing messages. This is demonstrated in [sample 15.a "piggyback data on every outgoing activity"](04.api/b.piggyback-on-outgoing-activities).

With Direct Line Speech, you can no longer piggyback additional data to all speech-based outgoing activities.

### Speech recognition language cannot be switched on-the-fly

> Please vote on [this bug](https://github.com/microsoft/BotFramework-WebChat/issues/2681) if this behavior is not desirable.

You can only specify speech recognition language at initialization time. You cannot switch speech recognition language while the conversation is active.

### Proactive message is not supported

> Please vote on [this bug](https://github.com/microsoft/BotFramework-WebChat/issues/2682) if this behavior is not desirable.

[Proactive message](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-proactive-message?view=azure-bot-service-4.0&tabs=csharp) is not supported when using Direct Line Speech.

### Abort recognition is not supported

> Please vote on [this bug](https://github.com/microsoft/BotFramework-WebChat/issues/2664) if this behavior is not desirable.

After the user click on microphone button to start speech recognition, they cannot click microphone button again to abort the recognition. What they have said will continue to be recognized and send to the bot.

### Custom Speech is not supported

Custom Speech is a feature for developers to train a custom speech model to improve speech recognition for uncommon words. You can set this up using the Speech SDK or in the Azure portal when configuring the Direct Line Speech channel.

### Dynamic priming is not supported

> Please vote on [this bug](https://github.com/microsoft/BotFramework-WebChat/issues/2685) if this behavior is not desirable.

Dynmic priming (a.k.a. pharse list) is a feature to improve speech recognition for words with similar pronunciations. This is not supported when using Direct Line Speech.

### Reference grammer ID is not supported

> Please vote on [this bug](https://github.com/microsoft/BotFramework-WebChat/issues/2686) if this behavior is not desirable.

Reference grammar ID is a feature to improve speech recognition accuracy when pairing with LUIS. This is not supported when using Direct Line Speech.

### Custom Voice is not supported

> Please vote on [this bug](https://github.com/microsoft/BotFramework-WebChat/issues/2687) if this behavior is not desirable.

Custom Voice is a feature for developers to perform synthesis using a custom voice font. This is not supported when using Direct Line Speech.

### Synthesis audio quality is not configurable

> Please vote on [this bug](https://github.com/microsoft/BotFramework-WebChat/issues/2688) if this behavior is not desirable.

When using Direct Line Speech, you cannot specify the audio quality and format for synthesizing speech.

### Alternative for Markdown

When the bot send activities to the user, it can send both plain text and Markdown. If Markdown is sent, the bot should also provide `speak` field. The `speak` field will be used for speech synthesis and not displayed to end-user.

### Attachments are not synthesized

> Please vote on [this bug](https://github.com/microsoft/BotFramework-WebChat/issues/2689) if this behavior is not desirable.

Attachments are not synthesized. The bot should provide a `speak` field for speech synthesis.

As attachments are not synthesized, `speak` property in Adaptive Cards are ignored. The bot should provide a `speak` field for speech synthesis.

### Selecting voice

> Please [submit a feature request](https://github.com/microsoft/BotFramework-WebChat/issues/new/choose) if this behavior is not desirable.

Voice can only be selected using Speech Synthesis Markup Language (SSML). For example, the following bot code will use a Japanese voice "NanamiNeural" for synthesis.

<!-- prettier-ignore-start -->
```js
await context.sendActivity(
  MessageFactory.text(
    `Echo: ${context.activity.text}`,
    `
    <speak
      version="1.0"
      xmlns="https://www.w3.org/2001/10/synthesis"
      xmlns:mstts="https://www.w3.org/2001/mstts"
      xml:lang="en-US"
    >
      <voice name="ja-JP-NanamiNeural">素晴らしい!</voice>
    </speak>
    `
  )
);
```
<!-- prettier-ignore-end -->

Please refer to [this article on SSML support](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-synthesis-markup).
