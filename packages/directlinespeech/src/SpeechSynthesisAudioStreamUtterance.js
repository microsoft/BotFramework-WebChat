import EventTarget, { getEventAttributeValue, setEventAttributeValue } from 'event-target-shim/es5';

class SpeechSynthesisAudioStreamUtterance extends EventTarget {
  constructor(audioStream) {
    super();

    if (audioStream && !(audioStream.format && typeof audioStream.read === 'function')) {
      throw new Error(
        'botframework-directlinespeech-sdk: If the first argument is specified, it must be a Cognitive Services audio stream.'
      );
    }

    this.audioStream = audioStream;
  }

  get onboundary() {
    return getEventAttributeValue(this, 'boundary');
  }

  set onboundary(value) {
    setEventAttributeValue(this, 'boundary', value);
  }

  get onend() {
    return getEventAttributeValue(this, 'end');
  }

  set onend(value) {
    setEventAttributeValue(this, 'end', value);
  }

  get onerror() {
    return getEventAttributeValue(this, 'error');
  }

  set onerror(value) {
    setEventAttributeValue(this, 'error', value);
  }

  get onstart() {
    return getEventAttributeValue(this, 'start');
  }

  set onstart(value) {
    setEventAttributeValue(this, 'start', value);
  }
}

export default SpeechSynthesisAudioStreamUtterance;
