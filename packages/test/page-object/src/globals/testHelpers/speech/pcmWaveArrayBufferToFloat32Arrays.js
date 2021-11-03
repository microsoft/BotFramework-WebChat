import deinterleaveArray from './deinterleaveArray';

function int16ToFloat32(int16Value) {
  if (int16Value > 32767 || int16Value < -32768) {
    throw new Error(`Value in the Int16Array must be between -32768 and 32767, we got ${int16Value}`);
  }

  return int16Value / 32768;
}

export default function pcmWaveArrayBufferToFloat32Arrays(arrayBuffer, numChannels) {
  const deinterleaved = deinterleaveArray(new Int16Array(arrayBuffer), numChannels);

  return deinterleaved.map(int16Array => new Float32Array(int16Array.map(int16ToFloat32)));
}
