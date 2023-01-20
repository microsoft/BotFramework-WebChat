/** @jest-environment jsdom */

/* eslint no-magic-numbers: "off" */

import hasResolved from 'has-resolved';

import playCognitiveServicesStream from './playCognitiveServicesStream';

function createMockAudioContext(autoEndCount = Infinity) {
  const audioContext = {
    connectedNodes: [],
    createBuffer(channels, frames, samplesPerSec) {
      const channelData = new Array(channels).fill().map(() => new Float32Array(frames));

      return {
        channelData,
        duration: 1,
        getChannelData(channel) {
          return channelData[+channel];
        },
        numberOfChannels: channels,
        samplesPerSec
      };
    },
    createBufferSource() {
      const endedEventListeners = [];

      const bufferSource = {
        addEventListener(name, listener) {
          name === 'ended' && endedEventListeners.push(listener);
        },
        buffer: null,
        connect(destination) {
          destination.push(bufferSource);
        },
        onended: null,
        start(time) {
          bufferSource.startAtTime = time;

          autoEndCount-- > 0 &&
            setTimeout(() => {
              bufferSource.onended && bufferSource.onended();
              endedEventListeners.forEach(listener => listener());
            }, 0);
        },
        startAtTime: NaN,
        stop() {
          bufferSource.stopped = true;
        }
      };

      return bufferSource;
    },
    currentTime: 0,
    destination: {
      push(node) {
        audioContext.connectedNodes.push(node);
      }
    }
  };

  return audioContext;
}

function createStreamFromChunks(format, chunks) {
  return {
    format,
    read(destination) {
      const chunk = chunks.shift();

      if (chunk) {
        new Uint8Array(destination).set(new Uint8Array(chunk));

        return Promise.resolve(chunk.byteLength);
      }

      return Promise.resolve(0);
    }
  };
}

test('should play 16-bit chunked stream to AudioContext', async () => {
  const audioContext = createMockAudioContext();
  const chunks = [new Uint8Array([0, 0]).buffer, new Uint8Array([0, 128]).buffer];

  await playCognitiveServicesStream(
    audioContext,
    createStreamFromChunks(
      {
        bitsPerSample: 16,
        channels: 1,
        samplesPerSec: 16000
      },
      chunks
    )
  );

  const nodes = audioContext.connectedNodes.map(bufferSource => ({
    channelData: bufferSource.buffer.channelData.map(arrayBuffer => new Float32Array(arrayBuffer.buffer, 0, 10)),
    startAtTime: bufferSource.startAtTime,
    samplesPerSec: bufferSource.buffer.samplesPerSec
  }));

  expect(nodes).toMatchInlineSnapshot(`
    Array [
      Object {
        "channelData": Array [
          Float32Array [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ],
        ],
        "samplesPerSec": 48000,
        "startAtTime": 0,
      },
      Object {
        "channelData": Array [
          Float32Array [
            -1,
            -1,
            -1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ],
        ],
        "samplesPerSec": 48000,
        "startAtTime": 1,
      },
    ]
  `);
});

test('should stop when abort is called after all buffer queued', async () => {
  const audioContext = createMockAudioContext(1);
  const chunks = [new Uint8Array([0, 0]).buffer, new Uint8Array([0, 128]).buffer];
  const abortController = new AbortController();

  const promise = playCognitiveServicesStream(
    audioContext,
    createStreamFromChunks(
      {
        bitsPerSample: 16,
        channels: 1,
        samplesPerSec: 16000
      },
      chunks
    ),
    { signal: abortController.signal }
  );

  abortController.abort();

  await expect(promise).rejects.toThrow('abort');

  expect(audioContext.connectedNodes.every(bufferSource => bufferSource.stopped)).toBeTruthy();
});

test('should stop when abort is called before first buffer is queued', async () => {
  const audioContext = createMockAudioContext();
  const abortController = new AbortController();

  const read = jest.fn(
    () =>
      new Promise(() => {
        // Never resolve read().
      })
  );

  const playPromise = playCognitiveServicesStream(
    audioContext,
    {
      format: {
        bitsPerSample: 16,
        channels: 1,
        samplesPerSec: 16000
      },
      read
    },
    { signal: abortController.signal }
  );

  await expect(hasResolved(playPromise)).resolves.toBeFalsy();

  abortController.abort();

  await expect(playPromise).rejects.toThrow('aborted');
});
