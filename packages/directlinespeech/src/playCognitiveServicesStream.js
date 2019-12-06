/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 8, 16, 32, 128, 1000, 32768, 96000, 2147483648] }] */
/* eslint no-await-in-loop: "off" */
/* eslint prefer-destructuring: "off" */

import cognitiveServicesPromiseToESPromise from './cognitiveServicesPromiseToESPromise';
import createMultiBufferingPlayer from './createMultiBufferingPlayer';

// Safari requires an audio buffer with a sample rate of 22050 Hz.
// Using a minimum sample rate of 44100 Hz as an example, the Speech SDK's default 16000 Hz will be upsampled to 48000 Hz.
const MIN_SAMPLE_RATE = 44100;

// The Speech SDK is hardcoded to chop packets to 4096 bytes.
// Web Chat's multi-buffering player is set up with 3 buffers; each is 4096 bytes (2048 16-bit samples).
// For simplicity, the multi-buffer player currently does not support progressive buffering.

// Progressive buffering allows queuing at any sample size and will be concatenated.
// If 1000 samples are queued, then 1048 samples are queued, they will be concatenated into a single buffer of size 2048.

// For simplicity, data will be queued to two buffers.
// The first buffer is 1000 samples followed by 1048 zeroes, and the second buffer is 1048 samples followed by 1000 zeroes.

// There is no plan to support progressive buffering until the Speech SDK chops data at dynamic size.
const DEFAULT_BUFFER_SIZE = 4096;

function average(array) {
  return array.reduce((sum, value) => sum + value, 0) / array.length;
}

function formatTypedBitArrayToFloatArray(audioData, maxValue) {
  const float32Data = new Float32Array(audioData.length);

  for (let i = 0; i < audioData.length; i++) {
    float32Data[i] = audioData[i] / maxValue;
  }

  return float32Data;
}

function formatAudioDataArrayBufferToFloatArray({ bitsPerSample }, arrayBuffer) {
  switch (bitsPerSample) {
    case 8:
      return formatTypedBitArrayToFloatArray(new Int8Array(arrayBuffer), 128);

    case 16:
      return formatTypedBitArrayToFloatArray(new Int16Array(arrayBuffer), 32768);

    case 32:
      return formatTypedBitArrayToFloatArray(new Int32Array(arrayBuffer), 2147483648);

    default:
      throw new Error('Only WAVE_FORMAT_PCM (8/16/32 bps) format supported at this time');
  }
}

function abortToReject(signal) {
  return new Promise((_, reject) => {
    signal.onabort = () => reject(new Error('aborted'));
  });
}

// In a 2 channel audio (e.g. A/B), the data arrives as interleaved, like "ABABABABAB".
// This function will take "ABABABABAB" and return an array ["AAAAA", "BBBBB"].
function deinterleave(channelInterleavedAudioData, { channels }) {
  const multiChannelArrayBuffer = new Array(channels);
  const frameSize = channelInterleavedAudioData.length / channels;

  for (let channel = 0; channel < channels; channel++) {
    const audioData = new Float32Array(frameSize);

    multiChannelArrayBuffer[channel] = audioData;

    for (let offset = 0; offset < frameSize; offset++) {
      audioData[offset] = channelInterleavedAudioData[offset * channels + channel];
    }
  }

  return multiChannelArrayBuffer;
}

// This function upsamples the audio data via an integer multiplier.
// Web Chat uses simple anti-aliasing. For simplicity, the anti-aliasing does not roll over to next buffer.
function multiplySampleRate(source, sampleRateMultiplier) {
  if (sampleRateMultiplier === 1) {
    return source;
  }

  const lastValues = new Array(sampleRateMultiplier).fill(source[0]);
  const target = new Float32Array(source.length * sampleRateMultiplier);

  for (let sourceOffset = 0; sourceOffset < source.length; sourceOffset++) {
    const value = source[sourceOffset];
    const targetOffset = sourceOffset * sampleRateMultiplier;

    for (let multiplierIndex = 0; multiplierIndex < sampleRateMultiplier; multiplierIndex++) {
      lastValues.shift();
      lastValues.push(value);
      target[targetOffset + multiplierIndex] = average(lastValues);
    }
  }

  return target;
}

export default async function playCognitiveServicesStream(
  audioContext,
  audioFormat,
  streamReader,
  { signal = {} } = {}
) {
  const queuedBufferSourceNodes = [];

  try {
    const abortPromise = abortToReject(signal);

    const read = () =>
      Promise.race([
        // Abort will gracefully end the queue. We will check signal.aborted later to throw abort exception.
        abortPromise.catch(() => ({ isEnd: true })),
        cognitiveServicesPromiseToESPromise(streamReader.read())
      ]);

    if (signal.aborted) {
      throw new Error('aborted');
    }

    let newSamplesPerSec = audioFormat.samplesPerSec;
    let sampleRateMultiplier = 1;

    // Safari requires a minimum sample rate of 22100 Hz.
    // A multiplier is calculated the the data meets the minimum sample rate.
    // An integer-based multiplier to simplify our upsampler.
    // For security, data will only be upsampled up to 96000 Hz.
    while (newSamplesPerSec < MIN_SAMPLE_RATE && newSamplesPerSec < 96000) {
      sampleRateMultiplier++;
      newSamplesPerSec = audioFormat.samplesPerSec * sampleRateMultiplier;
    }

    // The third parameter is the sample size in bytes.
    // For example, if the Speech SDK sends Web Chat 4096 bytes of 16-bit samples, there will be 2048 samples per channel.
    // The multi-buffering player is set up to handle 2048 samples per buffer.
    // If the multiplier 3x, it will handle 6144 samples per buffer.
    const player = createMultiBufferingPlayer(
      audioContext,
      { ...audioFormat, samplesPerSec: newSamplesPerSec },
      (DEFAULT_BUFFER_SIZE / (audioFormat.bitsPerSample / 8)) * sampleRateMultiplier
    );

    // For security, the maximum number of chunks handled will be 1000.
    for (
      let chunk = await read(), maxChunks = 0;
      !chunk.isEnd && maxChunks < 1000 && !signal.aborted;
      chunk = await read(), maxChunks++
    ) {
      if (signal.aborted) {
        break;
      }

      // Data received from Speech SDK is interleaved; 2 channels (e.g. A and B) will be sent as "ABABABABAB"
      // And each sample (A/B) will be an 8 to 32-bit number.

      // Convert the 8 - 32-bit number into a floating-point number, as required by Web Audio API.
      const interleavedArrayBuffer = formatAudioDataArrayBufferToFloatArray(audioFormat, chunk.buffer);

      // Deinterleave data back into two array buffer, e.g. "AAAAA" and "BBBBB".
      const multiChannelArrayBuffer = deinterleave(interleavedArrayBuffer, audioFormat);

      // Upsample data if necessary. If the multiplier is 2x, "AAAAA" will be upsampled to "AAAAAAAAAA" (with anti-alias).
      const upsampledMultiChannelArrayBuffer = multiChannelArrayBuffer.map(arrayBuffer =>
        multiplySampleRate(arrayBuffer, sampleRateMultiplier)
      );

      // Queue to the buffering player.
      player.push(upsampledMultiChannelArrayBuffer);
    }

    abortPromise.catch(() => player.cancelAll());

    if (signal.aborted) {
      throw new Error('aborted');
    }

    await Promise.race([abortPromise, player.flush()]);
  } finally {
    queuedBufferSourceNodes.forEach(node => node.stop());
  }
}
