import { AudioStreamFormat } from 'microsoft-cognitiveservices-speech-sdk';
import { RiffPcmEncoder } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/RiffPcmEncoder';

function cognitiveServicesPromiseToESPromise(promise) {
  return new Promise((resolve, reject) => promise.on(resolve, reject));
}

async function readAudioStreamAsPCMArrayBuffer({ streamReader }) {
  const read = () => cognitiveServicesPromiseToESPromise(streamReader.read());
  const buffers = [];
  let numBytes = 0;

  for (let chunk = await read(), maxChunks = 0; !chunk.isEnd && maxChunks < 1000; chunk = await read(), maxChunks++) {
    const buffer = new Uint8Array(chunk.buffer);

    buffers.push(buffer);
    numBytes += buffer.length;
  }

  const concatenatedTypedArray = new Uint8Array(numBytes);

  for (let index = 0, offset = 0; index < buffers.length; index++) {
    const buffer = buffers[index];

    concatenatedTypedArray.set(buffer, offset);
    offset += buffer.length;
  }

  return concatenatedTypedArray.buffer;
}

function formatArrayBuffer(audioData, maxValue) {
  const float32Data = new Float32Array(audioData.length);

  for (let i = 0; i < audioData.length; i++) {
    float32Data[i] = audioData[i] / maxValue;
  }

  return float32Data;
}

function formatAudioData({ bitsPerSample }, audioData) {
  switch (bitsPerSample) {
    case 8:
      return formatArrayBuffer(new Int8Array(audioData), 128);

    case 16:
      return formatArrayBuffer(new Int16Array(audioData), 32768);

    case 32:
      return formatArrayBuffer(new Int32Array(audioData), 2147483648);

    default:
      throw new InvalidOperationError('Only WAVE_FORMAT_PCM (8/16/32 bps) format supported at this time');
  }
}

export default async function readCognitiveServicesAudioStreamAsRiffWaveArrayBuffer(
  audioStream,
  audioFormat = AudioStreamFormat.getDefaultInputFormat()
) {
  const pcmArrayBuffer = await readAudioStreamAsPCMArrayBuffer(audioStream);
  const pcmFloatArray = formatAudioData(audioFormat, pcmArrayBuffer);
  const encoder = new RiffPcmEncoder(audioFormat.samplesPerSec, audioFormat.samplesPerSec);

  // Note: Groove Music do not play the WAV file because it lack of file length.
  //       VLC can play this WAV file.

  return encoder.encode(true, pcmFloatArray);
}
