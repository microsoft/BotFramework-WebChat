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

class MockAudioBufferSource {
  constructor() {
    this.buffer = null;
  }

  connect(node) {
    this._nextNode = node;
  }
}

class MockAudioDestinationNode {
  constructor(context) {
    this.context = context;
  }
}

export default class MockAudioContext {
  constructor() {
    this.destination = new MockAudioDestinationNode(this);
  }

  createBufferSource() {
    return new MockAudioBufferSource();
  }

  createBuffer(channels, frames, samplesPerSec) {
    return new MockAudioBuffer(channels, frames, samplesPerSec);
  }
}
