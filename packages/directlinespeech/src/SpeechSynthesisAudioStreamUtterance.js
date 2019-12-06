import EventTarget, { defineEventAttribute } from './external/event-target-shim';

class SpeechSynthesisAudioStreamUtterance extends EventTarget {
  constructor(audioStream) {
    super();

    if (audioStream && !(audioStream.format && audioStream.streamReader)) {
      throw new Error('The first argument must be a Cognitive Services audio stream.');
    }

    this.audioStream = audioStream;
  }
}

defineEventAttribute(SpeechSynthesisAudioStreamUtterance, 'boundary');
defineEventAttribute(SpeechSynthesisAudioStreamUtterance, 'end');
defineEventAttribute(SpeechSynthesisAudioStreamUtterance, 'error');
defineEventAttribute(SpeechSynthesisAudioStreamUtterance, 'start');

export default SpeechSynthesisAudioStreamUtterance;
