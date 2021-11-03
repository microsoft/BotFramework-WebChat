import { AudioStreamFormat } from 'microsoft-cognitiveservices-speech-sdk';

import {
  AudioSourceErrorEvent,
  AudioSourceInitializingEvent,
  AudioSourceOffEvent,
  AudioSourceReadyEvent,
  AudioStreamNodeAttachedEvent,
  AudioStreamNodeAttachingEvent,
  AudioStreamNodeDetachedEvent
} from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/AudioSourceEvents';

import { ChunkedArrayBufferStream } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/ChunkedArrayBufferStream';
import { createNoDashGuid } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/Guid';
import { Events } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/Events';
import { EventSource } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/EventSource';

const CHUNK_SIZE = 4096;

// This is copied from MicAudioSource, but instead of retrieving from MediaStream, we dump the ArrayBuffer directly.
class QueuedArrayBufferAudioSource {
  constructor(audioFormat, audioSourceId = createNoDashGuid()) {
    this._audioFormat = audioFormat;
    this._queue = [];
    this._id = audioSourceId;
    this._streams = {};

    this.onEvent = event => {
      this._events.onEvent(event);
      Events.instance.onEvent(event);
    };

    this._events = new EventSource();

    this.attach = this.attach.bind(this);
    this.detach = this.detach.bind(this);
    this.id = this.id.bind(this);
    this.listen = this.listen.bind(this);
    this.push = this.push.bind(this);
    this.turnOff = this.turnOff.bind(this);
    this.turnOn = this.turnOn.bind(this);
  }

  push(arrayBuffer) {
    // 10 seconds of audio in bytes =
    // sample rate (bytes/second) * 600 (seconds) + 44 (size of the wave header).
    const maxSize = this._audioFormat.samplesPerSec * 600 + 44;

    if (arrayBuffer.length > maxSize) {
      const errorMsg = `ArrayBuffer exceeds the maximum allowed file size (${maxSize}).`;

      this.onEvent(new AudioSourceErrorEvent(errorMsg, ''));

      return Promise.reject(errorMsg);
    }

    this._queue.push(arrayBuffer);
  }

  turnOn() {
    this.onEvent(new AudioSourceInitializingEvent(this._id)); // no stream id
    this.onEvent(new AudioSourceReadyEvent(this._id));

    return true;
  }

  id() {
    return this._id;
  }

  async attach(audioNodeId) {
    this.onEvent(new AudioStreamNodeAttachingEvent(this._id, audioNodeId));

    const stream = await this.listen(audioNodeId);

    this.onEvent(new AudioStreamNodeAttachedEvent(this._id, audioNodeId));

    return {
      detach: () => {
        stream.readEnded();

        delete this._streams[+audioNodeId];

        this.onEvent(new AudioStreamNodeDetachedEvent(this._id, audioNodeId));

        return this.turnOff();
      },
      id: () => audioNodeId,
      read: () => stream.read()
    };
  }

  detach(audioNodeId) {
    if (audioNodeId && this._streams[+audioNodeId]) {
      this._streams[+audioNodeId].close();

      delete this._streams[+audioNodeId];

      this.onEvent(new AudioStreamNodeDetachedEvent(this._id, audioNodeId));
    }
  }

  turnOff() {
    Object.values(this._streams).forEach(stream => stream && !stream.isClosed && stream.close());

    this.onEvent(new AudioSourceOffEvent(this._id)); // no stream now

    return true;
  }

  async listen(audioNodeId) {
    await this.turnOn();

    const stream = new ChunkedArrayBufferStream(this.format.avgBytesPerSec / 10, audioNodeId);

    this._streams[+audioNodeId] = stream;

    const arrayBuffer = this._queue.shift();
    const { byteLength } = arrayBuffer;

    for (let i = 0; i < byteLength; i += CHUNK_SIZE) {
      stream.writeStreamChunk({
        buffer: arrayBuffer.slice(i, Math.min(i + CHUNK_SIZE, byteLength)),
        isEnd: false,
        timeReceived: Date.now()
      });
    }

    stream.close();

    return stream;
  }

  get format() {
    return this._audioFormat;
  }

  get events() {
    return this._events;
  }

  get deviceInfo() {
    return {
      bitspersample: this._audioFormat.bitsPerSample,
      channelcount: this._audioFormat.channels,
      connectivity: 'Unknown',
      manufacturer: 'Speech SDK',
      model: 'File',
      samplerate: this._audioFormat.samplesPerSec,
      type: 'File'
    };
  }
}

export default function createQueuedArrayBufferAudioSource(
  audioFormat = AudioStreamFormat.getWaveFormatPCM(16000, 16, 1)
) {
  return new QueuedArrayBufferAudioSource(audioFormat);
}
