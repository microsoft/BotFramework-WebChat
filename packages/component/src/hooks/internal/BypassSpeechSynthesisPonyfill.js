// Since this is a bypass, we will relax some ESLint rules.
// All classes/properties defined here are in W3C Web Speech API.

/* eslint class-methods-use-this: "off" */
/* eslint getter-return: "off" */
/* eslint max-classes-per-file: ["error", 4] */
/* eslint no-empty-function: "off" */

import createOnEventShim from './private/createOnEventShim';

class SpeechSynthesisEvent extends Event {
  constructor(type, utterance) {
    super(type);

    this._utterance = utterance;
  }

  get charIndex() {
    return 0;
  }

  get elapsedTime() {
    return 0;
  }

  get name() {
    // It is expected to return `undefined`, keeping the function empty to reduce footprint.
  }

  get utterance() {
    return this._utterance;
  }
}

class SpeechSynthesisUtterance extends EventTarget {
  constructor(text) {
    super();

    this._lang = 'en-US';
    this._pitch = 1;
    this._rate = 1;
    this._text = text;
    this._voice = null;
    this._volume = 1;

    this._shim = createOnEventShim(this);
  }

  get lang() {
    return this._lang;
  }

  set lang(value) {
    this._lang = value;
  }

  get pitch() {
    return this._pitch;
  }

  set pitch(value) {
    this._pitch = value;
  }

  get rate() {
    return this._rate;
  }

  set rate(value) {
    this._rate = value;
  }

  get text() {
    return this._text;
  }

  set text(value) {
    this._text = value;
  }

  get voice() {
    return this._voice;
  }

  set voice(value) {
    this._voice = value;
  }

  get volume() {
    return this._volume;
  }

  set volume(value) {
    this._volume = value;
  }

  get onboundary() {
    return this._shim.get('boundary');
  }

  set onboundary(value) {
    this._shim.set('boundary', value);
  }

  get onend() {
    return this._shim.get('end');
  }

  set onend(value) {
    this._shim.set('end', value);
  }

  get onerror() {
    return this._shim.get('error');
  }

  set onerror(value) {
    this._shim.set('error', value);
  }

  get onmark() {
    return this._shim.get('mark');
  }

  set onmark(value) {
    this._shim.set('mark', value);
  }

  get onpause() {
    return this._shim.get('pause');
  }

  set onpause(value) {
    this._shim.set('pause', value);
  }

  get onresume() {
    return this._shim.get('resume');
  }

  set onresume(value) {
    this._shim.set('resume', value);
  }

  get onstart() {
    return this._shim.get('start');
  }

  set onstart(value) {
    this._shim.set('start', value);
  }
}

class SpeechSynthesisVoice {
  get default() {
    return true;
  }

  get lang() {
    return 'en-US';
  }

  get localService() {
    return true;
  }

  get name() {
    return 'English (US)';
  }

  get voiceURI() {
    return 'English (US)';
  }
}

class SpeechSynthesis extends EventTarget {
  constructor() {
    super();

    this._shim = createOnEventShim(this);
  }

  get paused() {
    return false;
  }

  get pending() {
    return false;
  }

  get speaking() {
    return false;
  }

  cancel() {}

  getVoices() {
    return [new SpeechSynthesisVoice()];
  }

  pause() {
    throw new Error('pause is not implemented.');
  }

  resume() {
    throw new Error('resume is not implemented.');
  }

  speak(utterance) {
    utterance.dispatchEvent(new SpeechSynthesisEvent('start', utterance));
    utterance.dispatchEvent(new SpeechSynthesisEvent('end', utterance));
  }

  get onvoiceschanged() {
    return this._shim.get('voiceschanged');
  }

  set onvoiceschanged(value) {
    this._shim.set('voiceschanged', value);
  }
}

const speechSynthesis = new SpeechSynthesis();

export { SpeechSynthesisEvent, SpeechSynthesisUtterance, SpeechSynthesisVoice, speechSynthesis };
