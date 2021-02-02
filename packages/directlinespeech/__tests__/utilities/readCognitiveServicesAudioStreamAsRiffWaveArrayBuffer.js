import { AudioStreamFormat } from 'microsoft-cognitiveservices-speech-sdk';
import { RiffPcmEncoder } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/RiffPcmEncoder';

async function readAudioStreamAsPCMArrayBuffer(stream) {
  const buffers = [];
  let numBytes = 0;

  for (let maxChunks = 0; maxChunks < 1000; maxChunks++) {
    const buffer = new ArrayBuffer(4096);

    const bytesRead = await stream.read(buffer);

    if (bytesRead) {
      buffers.push(new Uint8Array(buffer, 0, bytesRead));

      numBytes += bytesRead;
    } else {
      break;
    }
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

function createRIFFWaveHeader(audioFormat, waveDataLength) {
  const { bitsPerSample, channels, samplesPerSec } = audioFormat;
  const buffer = new ArrayBuffer(44);
  const bytesPerSample = bitsPerSample / 8;
  const view = new DataView(buffer);

  // RIFF identifier
  setASCIIString(view, 0, 'RIFF');

  // file length
  view.setUint32(4, waveDataLength + 36, true);

  // RIFF type & Format
  setASCIIString(view, 8, 'WAVEfmt ');

  // format chunk length
  view.setUint32(16, 16, true);

  // sample format (raw)
  view.setUint16(20, 1, true);

  // channel count
  view.setUint16(22, channels, true);

  // sample rate
  view.setUint32(24, samplesPerSec, true);

  // byte rate (sample rate * block align)
  view.setUint32(28, samplesPerSec * channels * bytesPerSample, true);

  // block align (channel count * bytes per sample)
  view.setUint16(32, channels * bytesPerSample, true);

  // bits per sample
  view.setUint16(34, bitsPerSample, true);

  // data chunk identifier
  setASCIIString(view, 36, 'data');

  // data chunk length
  view.setUint32(40, waveDataLength, true);

  return buffer;
}

function setASCIIString(view, offset, value) {
  for (let i = 0; i < value.length; i++) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

function concatArrayBuffer(x, y) {
  x = new Uint8Array(x);
  y = new Uint8Array(y);

  const concatenated = new Uint8Array(x.length + y.length);

  for (let i = 0; i < x.length; i++) {
    concatenated[i] = x[i];
  }

  for (let i = 0; i < y.length; i++) {
    concatenated[i + x.length] = y[i];
  }

  return concatenated.buffer;
}

export default async function readCognitiveServicesAudioStreamAsRiffWaveArrayBuffer(
  audioStream,
  audioFormat = AudioStreamFormat.getDefaultInputFormat()
) {
  const pcmArrayBuffer = await readAudioStreamAsPCMArrayBuffer(audioStream);
  const pcmFloatArray = formatAudioData(audioFormat, pcmArrayBuffer);
  const encoder = new RiffPcmEncoder(audioFormat.samplesPerSec, audioFormat.samplesPerSec);
  const riffWaveArrayBuffer = encoder.encode(pcmFloatArray);
  const riffWaveHeader = createRIFFWaveHeader(audioFormat, riffWaveArrayBuffer.byteLength);

  return concatArrayBuffer(riffWaveHeader, riffWaveArrayBuffer);
}
