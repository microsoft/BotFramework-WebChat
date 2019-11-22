import EventTarget, { defineEventAttribute } from './external/event-target-shim';

class SpeechSynthesisAudioStreamUtterance extends EventTarget {}

defineEventAttribute(SpeechSynthesisAudioStreamUtterance, 'boundary');
defineEventAttribute(SpeechSynthesisAudioStreamUtterance, 'end');
defineEventAttribute(SpeechSynthesisAudioStreamUtterance, 'error');
defineEventAttribute(SpeechSynthesisAudioStreamUtterance, 'start');

function fromAudioStream(audioStream) {
  const utterance = new SpeechSynthesisAudioStreamUtterance();

  utterance.audioStream = audioStream;

  return utterance;
}

export default SpeechSynthesisAudioStreamUtterance;

export { fromAudioStream };
