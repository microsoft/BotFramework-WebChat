// eslint no-magic-numbers: "off"

// Importing from "bundle" as we do not expose this function.
import createAudioConfig from '../../../../../../../bundle/src/speech/createAudioConfig';

const QUORUM_SIZE = 9600;

/** Creates a Speech SDK AudioConfig for audio input based from an ArrayBuffer of RIFF WAV. */
export default function fromRiffWavArrayBuffer(arrayBuffer) {
  const [channels] = new Uint16Array(arrayBuffer.slice(22, 24));
  const [samplesPerSec] = new Uint32Array(arrayBuffer.slice(24, 28));
  const [bitsPerSample] = new Uint16Array(arrayBuffer.slice(34, 36));

  // Search the offset of "data" marker, earliest possible position is 36.
  // "data" === 64-61-74-61.

  let dataOffset;

  for (let index = 36; index < 200; index++) {
    const bytes = new Uint8Array(arrayBuffer.slice(index, index + 4));

    if (bytes[0] === 0x64 && bytes[1] === 0x61 && bytes[2] === 0x74 && bytes[3] === 0x61) {
      dataOffset = index + 4;
      break;
    }
  }

  if (!dataOffset) {
    throw new Error('Cannot find "data" section marker in the RIFF WAV ArrayBuffer.');
  }

  const bytesPerSecond = samplesPerSec * channels * (bitsPerSample >> 3);
  const now = Date.now();

  return createAudioConfig({
    attach(audioNodeId) {
      let offset = dataOffset;

      return Promise.resolve({
        audioStreamNode: {
          detach: () => {
            // This is a mock and will no-op on dispatch().
          },
          id: () => audioNodeId,
          read: () => {
            if (offset >= arrayBuffer.byteLength) {
              return { isEnd: true };
            }

            const buffer = arrayBuffer.slice(offset, offset + QUORUM_SIZE);

            offset += QUORUM_SIZE;

            return {
              isEnd: false,
              buffer,
              timeReceived: now + ~~((offset - dataOffset) / bytesPerSecond)
            };
          }
        },
        deviceInfo: {
          model: 'RIFF WAV ArrayBuffer',
          type: 'Stream'
        },
        format: {
          bitsPerSample,
          channels,
          samplesPerSec
        }
      });
    }
  });
}
