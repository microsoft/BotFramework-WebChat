export default class SpeechSynthesisVoice {
  /** @type {boolean} */
  #default = false;

  /** @type {string} */
  #lang = '';

  /** @type {boolean} */
  #localService = false;

  /** @type {string} */
  #name = '';

  /** @type {string} */
  #voiceURI = '';

  get default() {
    return this.#default;
  }

  get lang() {
    return this.#lang;
  }

  get localService() {
    return this.#localService;
  }

  get name() {
    return this.#name;
  }

  get voiceURI() {
    return this.#voiceURI;
  }

  static from(init) {
    const voice = new SpeechSynthesisVoice();

    voice.#default = init.default;
    voice.#lang = init.lang;
    voice.#localService = init.localService;
    voice.#name = init.name;
    voice.#voiceURI = init.voiceURI;

    return voice;
  }
}
