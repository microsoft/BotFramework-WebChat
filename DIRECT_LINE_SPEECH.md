# Using Direct Line Speech

> For Cognitive Services Speech Services, please refer to [`SPEECH.md`](https://github.com/microsoft/BotFramework-WebChat/blob/master/SPEECH.md).

This guide is for integrating Direct Line Speech.

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
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td><a href="#custom-speech">Custom Speech</a></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td><a href="#text-normalization-options">Text normalization options</a></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td>Abort recognition</td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td>Interims</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td>Dynamic priming</td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td>Reference grammar ID</td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
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
      <td>Select language on-the-fly</td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td><a href="#notes-1"><sup>*1</sup></a></td>
    </tr>
    <tr>
      <td>STT</td>
      <td><a href="#using-input-hint">Input hint</a></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
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
      <td><a href="#custom-voice">Custom Voice</a></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
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
      <td><a href="#text-to-speech-audio-format">Text-to-speech audio format</a></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td>Stripping text from Markdown</td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
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
      <td>Adaptive Cards using "speak" property</td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❌</th><td></td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td>Interrupt synthesis when clicking on microphone button (<a href="https://github.com/microsoft/BotFramework-WebChat/issues/2428">Bug</a>) (<a href="https://github.com/microsoft/BotFramework-WebChat/pull/2429">PR</a>)</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>✔</th><td>4.7</td>
      <th>❓</th><td><a href="#notes-2"><sup>*2</sup></a></td>
    </tr>
    <tr>
      <td>TTS</td>
      <td>Synthesize activity with multiple attachments</td>
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
   -  Currently blocked by https://github.com/microsoft/cognitive-services-speech-sdk-js/issues/96
   -  Tracking bug at https://github.com/microsoft/BotFramework-WebChat/issues/2481

## Requirements

Direct Line Speech shares the same requirements as Cognitive Services Speech Services. Please refer to [`SPEECH.md`](https://github.com/microsoft/BotFramework-WebChat/blob/master/SPEECH.md#requirements).
