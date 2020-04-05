import EventTarget, { defineEventAttribute } from 'event-target-shim';

class MockAudioBuffer {
  constructor(channels, frames, samplesPerSec) {
    this._channels = channels;
    this._channelData = new Array(channels).fill().map(() => new Array(frames * samplesPerSec));
  }

  getChannelData(channel) {
    return this._channelData[channel];
  }

  get numberOfChannels() {
    return this._channels;
  }
}

class MockAudioBufferSource extends EventTarget {
  constructor({ startHandler } = {}) {
    super();

    this.buffer = null;
    this._startHandler = startHandler;
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

    this.dispatchEvent(new Event('ended'));
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

defineEventAttribute(MockAudioBufferSource.prototype, 'ended');

export default class MockAudioContext extends EventTarget {
  constructor({ audioDataDecoder, bufferSourceStartHandler } = {}) {
    super();

    this.destination = new MockAudioDestinationNode(this);

    this._audioDataDecoder = audioDataDecoder;
    this._bufferSourceStartHandler = bufferSourceStartHandler;
    this.state = 'running';
  }

  close() {
    this.state = 'closed';
    this.dispatchEvent(new Event('statechange'));
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
      this.dispatchEvent(new Event('statechange'));
    }
  }

  suspend() {
    if (this.state === 'running') {
      this.state = 'suspended';
      this.dispatchEvent(new Event('statechange'));
    }
  }

  async decodeAudioData(arrayBuffer) {
    if (this._audioDataDecoder) {
      return await this._audioDataDecoder(arrayBuffer);
    } else {
      return arrayBuffer;
    }
  }
}

defineEventAttribute(MockAudioContext.prototype, 'statechange');
