// Since this is a bypass, we will relax some ESLint rules.
// All classes/properties defined here are in W3C Web Speech API.

/* eslint class-methods-use-this: "off" */
/* eslint getter-return: "off" */
/* eslint max-classes-per-file: ["error", 4] */
/* eslint no-empty-function: "off" */

import EventTarget, { defineEventAttribute } from '../external/event-target-shim';

class SpeechSynthesisEvent {
  constructor(type, utterance) {
    this._type = type;
    this._utterance = utterance;
  }

  get charIndex() {
    return 0;
  }

  get elapsedTime() {
    return 0;
  }

  get name() {}

  get type() {
    return this._type;
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
}

defineEventAttribute(SpeechSynthesisUtterance.prototype, 'boundary');
defineEventAttribute(SpeechSynthesisUtterance.prototype, 'end');
defineEventAttribute(SpeechSynthesisUtterance.prototype, 'error');
defineEventAttribute(SpeechSynthesisUtterance.prototype, 'mark');
defineEventAttribute(SpeechSynthesisUtterance.prototype, 'pause');
defineEventAttribute(SpeechSynthesisUtterance.prototype, 'resume');
defineEventAttribute(SpeechSynthesisUtterance.prototype, 'start');

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
}

defineEventAttribute(SpeechSynthesis.prototype, 'voiceschanged');

const speechSynthesis = new SpeechSynthesis();

export { speechSynthesis, SpeechSynthesisEvent, SpeechSynthesisUtterance, SpeechSynthesisVoice };
