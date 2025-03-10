// This will mock multiple classes.
/* eslint-disable max-classes-per-file */

// A lot of mock functions are empty and do not reference `this`.
/* eslint-disable class-methods-use-this */

import EventTarget, { getEventAttributeValue, setEventAttributeValue } from 'event-target-shim';

import pcmWaveArrayBufferToFloat32Arrays from '../pcmWaveArrayBufferToFloat32Arrays';

function createCustomEvent(name) {
  if (name === 'error') {
    if (typeof ErrorEvent === 'function') {
      return new ErrorEvent(name);
    }
  } else if (typeof CustomEvent === 'function') {
    return new CustomEvent(name);
  }

  const event = document.createEvent('Event');

  event.initEvent(name, true, true);

  return event;
}

class MockAudioBuffer {
  constructor(numberOfChannels, length, sampleRate) {
    // Length is number of samples to keep. This does not count as bytes, but as number of sample-frame.
    // Since each sample-frame contains all channels, this number is just numSeconds * sampleRate.
    this._length = length;
    this._numberOfChannels = numberOfChannels;
    this._sampleRate = sampleRate;

    const bufferSize = length * 4;

    // In Web Audio API, it use Float32, that means the ArrayBuffer need to be 4x of number of samples.
    this._channelData = new Array(numberOfChannels).fill().map(() => new ArrayBuffer(bufferSize));
  }

  copyToChannel(float32Array, channel) {
    new Float32Array(this.getChannelData(channel)).set(float32Array);
  }

  getChannelData(channel) {
    return this._channelData[+channel];
  }

  get length() {
    return this._length;
  }

  get numberOfChannels() {
    return this._numberOfChannels;
  }

  get sampleRate() {
    return this._sampleRate;
  }
}

class MockAudioBufferSource extends EventTarget {
  constructor({ startHandler } = {}) {
    super();

    this.buffer = null;
    this._startHandler = startHandler;
  }

  get onended() {
    return getEventAttributeValue(this, 'ended');
  }

  set onended(value) {
    setEventAttributeValue(this, 'ended', value);
  }

  connect(node) {
    this._nextNode = node;
  }

  async start(when, offset, duration) {
    if (this._startHandler) {
      this._stopHandler = await this._startHandler({
        duration,
        offset,
        target: this,
        when
      });
    }

    this.dispatchEvent(createCustomEvent('ended'));
  }

  stop(when) {
    if (!this._stopHandler) {
      throw new Error('InvalidStateNode');
    }

    this._stopHandler(when);
    this._stopHandler = null;
  }
}

class MockAudioDestinationNode {
  constructor(context) {
    this.context = context;
  }
}

export default class MockAudioContext extends EventTarget {
  constructor({ audioDataDecoder, bufferSourceStartHandler } = {}) {
    super();

    this.destination = new MockAudioDestinationNode(this);

    this._audioDataDecoder = audioDataDecoder;
    this._bufferSourceStartHandler = bufferSourceStartHandler;
    this.state = 'running';
  }

  get onstatechange() {
    return getEventAttributeValue(this, 'statechange');
  }

  set onstatechange(value) {
    setEventAttributeValue(this, 'statechange', value);
  }

  close() {
    this.state = 'closed';
    this.dispatchEvent(createCustomEvent('statechange'));
  }

  createBufferSource() {
    return new MockAudioBufferSource({ startHandler: this._bufferSourceStartHandler });
  }

  createBuffer(channels, frames, samplesPerSec) {
    return new MockAudioBuffer(channels, frames, samplesPerSec);
  }

  resume() {
    if (this.state === 'suspended') {
      this.state = 'running';
      this.dispatchEvent(createCustomEvent('statechange'));
    }
  }

  suspend() {
    if (this.state === 'running') {
      this.state = 'suspended';
      this.dispatchEvent(createCustomEvent('statechange'));
    }
  }

  decodeAudioData(arrayBuffer) {
    if (this._audioDataDecoder) {
      return this._audioDataDecoder(arrayBuffer);
    }

    const header = [...new Uint8Array(arrayBuffer.slice(0, 3))];

    if (header[0] === 73 && header[1] === 68 && header[2] === 51) {
      // MP3 starts with "ID3" tag
      // eslint-disable-next-line no-console
      console.log('MP3 is not supported; ignoring this audio data.');

      // Speech SDK requires Promise and would fail silently if it is a resolved result.
      return Promise.resolve(this.createBuffer(1, 0, 16000));
    }

    // We assume the audio data is PCM raw 16-bit 16000 Hz mono.
    const buffer = this.createBuffer(1, arrayBuffer.byteLength / 2, 16000);

    new Float32Array(buffer.getChannelData(0)).set(pcmWaveArrayBufferToFloat32Arrays(arrayBuffer, 1)[0]);

    // Speech SDK requires Promise and would fail silently if it is a resolved result.
    return Promise.resolve(buffer);
  }
}
