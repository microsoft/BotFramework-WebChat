import EventTarget, { defineEventAttribute } from 'event-target-shim-es5';

class SpeechSynthesisAudioStreamUtterance extends EventTarget {
  constructor(audioStream) {
    super();

    if (audioStream && !(audioStream.format && typeof audioStream.read === 'function')) {
      throw new Error('botframework-directlinespeech-sdk: If the first argument is specified, it must be a Cognitive Services audio stream.');
    }

    this.audioStream = audioStream;
  }
}

defineEventAttribute(SpeechSynthesisAudioStreamUtterance, 'boundary');
defineEventAttribute(SpeechSynthesisAudioStreamUtterance, 'end');
defineEventAttribute(SpeechSynthesisAudioStreamUtterance, 'error');
defineEventAttribute(SpeechSynthesisAudioStreamUtterance, 'start');

export default SpeechSynthesisAudioStreamUtterance;
