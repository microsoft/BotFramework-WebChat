import { EventTargetProperties } from 'https://unpkg.com/event-target-properties@latest/dist/event-target-properties.mjs';

export default class SpeechSynthesisUtterance extends EventTarget {
  constructor(text) {
    super();

    this.#eventTargetProperties = new EventTargetProperties(this);
    this.text = text || '';
  }

  #eventTargetProperties;

  /** @type {string} */
  lang;
  /** @type {number} */
  pitch;
  /** @type {number} */
  rate;
  /** @type {string} */
  text;
  /** @type {any} */
  voice;
  /** @type {number} */
  volume;

  get onboundary() {
    return this.#eventTargetProperties.getProperty('boundary');
  }

  set onboundary(value) {
    this.#eventTargetProperties.setProperty('boundary', value);
  }

  get onend() {
    return this.#eventTargetProperties.getProperty('end');
  }

  set onend(value) {
    this.#eventTargetProperties.setProperty('end', value);
  }

  get onerror() {
    return this.#eventTargetProperties.getProperty('error');
  }

  set onerror(value) {
    this.#eventTargetProperties.setProperty('error', value);
  }

  get onmark() {
    return this.#eventTargetProperties.getProperty('mark');
  }

  set onmark(value) {
    this.#eventTargetProperties.setProperty('mark', value);
  }

  get onpause() {
    return this.#eventTargetProperties.getProperty('pause');
  }

  set onpause(value) {
    this.#eventTargetProperties.setProperty('pause', value);
  }

  get onresume() {
    return this.#eventTargetProperties.getProperty('resume');
  }

  set onresume(value) {
    this.#eventTargetProperties.setProperty('resume', value);
  }

  get onstart() {
    return this.#eventTargetProperties.getProperty('start');
  }

  set onstart(value) {
    this.#eventTargetProperties.setProperty('start', value);
  }
}
