import concatArrayBuffer from './concatArrayBuffer';

const RIFF_WAVE_HEADER_SIZE = 44;

function setASCIIString(view, offset, value) {
  for (let i = 0; i < value.length; i++) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

function createRIFFWaveHeaderArray({ bitsPerSample, channels, samplesPerSec }, waveDataLength) {
  const array = new Uint8Array(RIFF_WAVE_HEADER_SIZE);
  const bytesPerSample = bitsPerSample / 8;
  const view = new DataView(array.buffer);

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

  return array;
}

export default function pcmWaveArrayBufferToRiffWaveArrayBuffer(
  pcmWaveArrayBuffer,
  { bitsPerSample = 16, channels = 1, samplesPerSec = 16000 } = {}
) {
  if (!(pcmWaveArrayBuffer instanceof ArrayBuffer)) {
    throw new Error('pcmWaveArrayBuffer must be an ArrayBuffer');
  }

  const { byteLength: pcmWaveDataLength } = pcmWaveArrayBuffer;

  return concatArrayBuffer(
    createRIFFWaveHeaderArray(
      {
        bitsPerSample,
        channels,
        samplesPerSec
      },
      pcmWaveDataLength
    ).buffer,
    pcmWaveArrayBuffer
  );
}
