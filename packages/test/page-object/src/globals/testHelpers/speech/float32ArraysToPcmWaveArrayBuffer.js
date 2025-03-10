import interleaveArray from './interleaveArray';

function float32ToInt16(float32Value) {
  if (float32Value > 1 || float32Value < -1) {
    console.warn(`Value in the Float32Array must be between -1 and 1, we got ${float32Value}`);
  }

  return Math.min(32767, Math.max(-32768, Math.round(float32Value * 32768)));
}

export default function float32ArraysToPcmWaveArrayBuffer(channels) {
  if (channels.length < 1 || channels.length > 2) {
    throw new Error('channels must have 1 or 2 channels only.');
  } else if (channels.length === 2 && channels[0].length !== channels[1].length) {
    throw new Error('Both channels must have the same length.');
  }

  const int16Channels = channels.map(channel => channel.map(float32ToInt16));

  return new Int16Array(interleaveArray(...int16Channels)).buffer;
}
