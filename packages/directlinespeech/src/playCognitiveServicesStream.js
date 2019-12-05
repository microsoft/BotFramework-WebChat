/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 8, 16, 32, 128, 1000, 32768, 96000, 2147483648] }] */
/* eslint no-await-in-loop: "off" */
/* eslint prefer-destructuring: "off" */

import cognitiveServicesPromiseToESPromise from './cognitiveServicesPromiseToESPromise';
import createMultiBufferingPlayer from './createMultiBufferingPlayer';

// Safari requires audio buffer with sample rate of 22050 Hz.
// Let's use 44100 Hz, Speech SDK's default 16000 Hz sample will be upsampled to 48000 Hz.
const MIN_SAMPLE_RATE = 44100;

// We assume Speech SDK chop packet at size 4096 bytes, they hardcode it in Speech SDK.
// We will set up our multi-buffering player with 3 buffers each of 4096 bytes (2048 of 16-bit samples).
// For simplicity, our multi-buffer player currently do not support progressive buffering.

// Progressive buffering means, we can queue at any sample size and they will be concatenated.
// For example, queue 1000 samples, then queue 1048 samples, they will be concatenated into a single buffer of size 2048.

// Currently, for simplicity, we will queue as two buffers.
// First one is 1000 samples followed by 1048 zeroes, second one is 1048 sample followed by 1000 zeroes.

// There is no plan to support progressive buffering unless Speech SDK chop at dynamic size.
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

// In a 2 channel audio (A/B), the data come as interleaved like "ABABABABAB".
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

// This function upsample the audio data by an integer multiplier.
// We implemented simple anti-aliasing. For simplicity, the anti-aliasing do not roll over to next buffer.
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
    // We will calculate a multiplier so it meet the minimum sample rate.
    // We prefer an integer-based multiplier to simplify our upsampler.
    // For safety, we will only upsample up to 96000 Hz.
    while (newSamplesPerSec < MIN_SAMPLE_RATE && newSamplesPerSec < 96000) {
      sampleRateMultiplier++;
      newSamplesPerSec = audioFormat.samplesPerSec * sampleRateMultiplier;
    }

    // The third parameter is sample size in bytes.
    // For example, Speech SDK send us 4096 bytes of 16-bit samples. That means, 2048 samples per channel.
    // The multi-buffering player will be set up to handle 2048 samples per buffer.
    // If we have a multiplier of 3x, it will handle 6144 samples per buffer.
    const player = createMultiBufferingPlayer(
      audioContext,
      { ...audioFormat, samplesPerSec: newSamplesPerSec },
      (DEFAULT_BUFFER_SIZE / (audioFormat.bitsPerSample / 8)) * sampleRateMultiplier
    );

    // For safety, we will only handle up to 1000 chunks.
    for (
      let chunk = await read(), maxChunks = 0;
      !chunk.isEnd && maxChunks < 1000 && !signal.aborted;
      chunk = await read(), maxChunks++
    ) {
      if (signal.aborted) {
        break;
      }

      // Data received from Speech SDK is interleaved. It means, 2 channel (A/B) will be sent as "ABABABABAB"
      // And each sample (A/B) will be a 8 to 32-bit number.

      // First, we convert 8 to 32-bit number, into a floating-point number, which is required by Web Audio API.
      const interleavedArrayBuffer = formatAudioDataArrayBufferToFloatArray(audioFormat, chunk.buffer);

      // Then, we deinterleave them back into two array buffer, as "AAAAA" and "BBBBB".
      const multiChannelArrayBuffer = deinterleave(interleavedArrayBuffer, audioFormat);

      // Lastly, if needed, we will upsample them. If the multiplier is 2x, "AAAAA" will become "AAAAAAAAAA" (with anti-alias).
      const upsampledMultiChannelArrayBuffer = multiChannelArrayBuffer.map(arrayBuffer =>
        multiplySampleRate(arrayBuffer, sampleRateMultiplier)
      );

      // Queue it to the buffering player.
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
