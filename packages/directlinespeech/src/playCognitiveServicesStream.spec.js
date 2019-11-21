import playCognitiveServicesStream from './playCognitiveServicesStream';

let audioContext;

beforeEach(() => {
  audioContext = {
    connectedNodes: [],
    createBuffer(channels, frames, samplesPerSec) {
      const channelData = new Array(channels).fill(new Array(frames));

      return {
        channelData,
        duration: 1,
        getChannelData(channel) {
          return channelData[channel];
        },
        samplesPerSec
      };
    },
    createBufferSource() {
      const bufferSource = {
        buffer: null,
        connect(destination) {
          destination.push(bufferSource);
        },
        onended: null,
        start(time) {
          bufferSource.startAtTime = time;

          setTimeout(() => {
            bufferSource.onended && bufferSource.onended();
          }, 0);
        },
        startAtTime: NaN
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
});

function createStreamReader(chunks) {
  return {
    read() {
      const chunk = chunks.shift();

      if (chunk) {
        return {
          on(resolve) {
            resolve({
              buffer: chunk,
              isEnd: false
            });
          }
        };
      } else {
        return {
          on(resolve) {
            resolve({ isEnd: true });
          }
        };
      }
    }
  };
}

test('should play 16-bit chunked stream to AudioContext', async () => {
  const chunks = [new Uint8Array([0, 0]).buffer, new Uint8Array([0, 128]).buffer];

  await playCognitiveServicesStream(
    audioContext,
    {
      bitsPerSample: 16,
      channels: 1,
      samplesPerSec: 16000
    },
    createStreamReader(chunks)
  );

  const nodes = audioContext.connectedNodes.map(bufferSource => {
    return {
      channelData: new Float32Array(bufferSource.buffer.channelData),
      startAtTime: bufferSource.startAtTime,
      samplesPerSec: bufferSource.buffer.samplesPerSec
    };
  });

  expect(nodes).toMatchInlineSnapshot(`
    Array [
      Object {
        "channelData": Float32Array [
          0,
        ],
        "samplesPerSec": 16000,
        "startAtTime": 0,
      },
      Object {
        "channelData": Float32Array [
          -1,
        ],
        "samplesPerSec": 16000,
        "startAtTime": 1,
      },
    ]
  `);
});
